# Generated by Django 4.0.3 on 2022-08-06 10:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_spotify', '0003_alter_spotifyusertoken_managers_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spotifyusertoken',
            name='spotify_id',
            field=models.CharField(blank=True, max_length=300, null=True, unique=True),
        ),
    ]
