Upload your damage dataset in this folder.

Recommended structure:

```text
server/ai_module/data/datasets/damage_dataset/
├── train/
│   ├── no_damage/
│   ├── minor/
│   ├── major/
│   └── critical/
└── val/
    ├── no_damage/
    ├── minor/
    ├── major/
    └── critical/
```

This is the folder you should upload your dataset into.

After uploading, run:

```powershell
python scripts/train_damage_model.py
```

If you uploaded a YOLO dataset with this structure instead:

```text
server/ai_module/data/datasets/
├── train/
│   ├── images/
│   └── labels/
└── test/
    ├── images/
    └── labels/
```

that dataset is used for object-category validation training, not 4-class damage-severity training.

Train it with:

```powershell
python scripts/train_object_validator.py
```
