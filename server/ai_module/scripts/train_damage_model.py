from pathlib import Path
import sys
import os

CURRENT_FILE = Path(__file__).resolve()
PROJECT_ROOT = CURRENT_FILE.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.models import ResNet18_Weights, resnet18

from app.config import DAMAGE_CLASSES, DAMAGE_MODEL_WEIGHTS, DATASET_DIR


def train() -> None:
    train_dir = DATASET_DIR / "train"
    val_dir = DATASET_DIR / "val"

    if not train_dir.exists() or not val_dir.exists():
        raise FileNotFoundError(
            "Damage dataset not found in ImageFolder format. Upload a 4-class dataset to "
            f"{DATASET_DIR} with train/val folders for: {', '.join(DAMAGE_CLASSES)}"
        )

    device = torch.device("cpu")
    weights = ResNet18_Weights.DEFAULT
    base_transforms = weights.transforms()
    train_transforms = transforms.Compose(
        [
            transforms.RandomResizedCrop(224, scale=(0.65, 1.0), ratio=(0.8, 1.25)),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(brightness=0.45, contrast=0.35, saturation=0.25, hue=0.03),
            transforms.RandomAutocontrast(p=0.25),
            transforms.RandomAdjustSharpness(sharpness_factor=1.5, p=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean=base_transforms.mean, std=base_transforms.std),
        ]
    )
    val_transforms = base_transforms

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transforms)

    train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=8, shuffle=False)

    model = resnet18(weights=weights)
    model.fc = nn.Linear(model.fc.in_features, len(DAMAGE_CLASSES))
    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)

    best_val_accuracy = 0.0
    DAMAGE_MODEL_WEIGHTS.parent.mkdir(parents=True, exist_ok=True)

    epochs = int(os.getenv("DAMAGE_TRAIN_EPOCHS", "20"))

    for epoch in range(epochs):
        model.train()
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()

        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                logits = model(images)
                preds = logits.argmax(dim=1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)

        accuracy = correct / total if total else 0.0
        print(f"Epoch {epoch + 1}: val_accuracy={accuracy:.4f}")

        if accuracy > best_val_accuracy:
            best_val_accuracy = accuracy
            torch.save(model.state_dict(), DAMAGE_MODEL_WEIGHTS)
            print(f"Saved best model to {DAMAGE_MODEL_WEIGHTS}")


if __name__ == "__main__":
    train()
