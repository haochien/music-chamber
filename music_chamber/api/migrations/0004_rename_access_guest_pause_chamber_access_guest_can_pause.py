# Generated by Django 4.0.3 on 2022-04-09 19:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_rename_active_chamber_is_active'),
    ]

    operations = [
        migrations.RenameField(
            model_name='chamber',
            old_name='access_guest_pause',
            new_name='access_guest_can_pause',
        ),
    ]