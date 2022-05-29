# Generated by Django 4.0.3 on 2022-05-23 21:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_chamber_song_end_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='chamber',
            name='play_list_on_play',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='chamber',
            name='song_duration',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
