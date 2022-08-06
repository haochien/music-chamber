# Generated by Django 4.0.3 on 2022-08-01 21:05

import api_spotify.managers
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api_spotify', '0002_alter_spotifyusertoken_access_token_and_more'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='spotifyusertoken',
            managers=[
                ('objects', api_spotify.managers.SpotifyUserLoginManager()),
            ],
        ),
        migrations.RemoveField(
            model_name='spotifyusertoken',
            name='user_session',
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='country',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='display_name',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='email',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='images',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='is_admin',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='last_login',
            field=models.DateTimeField(null=True),
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='product',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='spotifyusertoken',
            name='spotify_id',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
        migrations.AlterField(
            model_name='spotifyusertoken',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
