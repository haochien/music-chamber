# Generated by Django 4.0.3 on 2022-04-09 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='chamber',
            name='is_public',
            field=models.BooleanField(default=False),
        ),
    ]
