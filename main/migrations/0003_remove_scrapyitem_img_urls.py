# Generated by Django 2.0.4 on 2018-04-16 18:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_auto_20180415_2315'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='scrapyitem',
            name='img_urls',
        ),
    ]
