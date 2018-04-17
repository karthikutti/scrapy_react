import json
from django.db import models
from django.utils import timezone


class ScrapyItem(models.Model):
    unique_id = models.CharField(max_length=100, null=True)
    link_url = models.TextField()  # this stands for our crawled data
    image_urls = models.TextField()  # this stands for our crawled data
    #date = models.DateTimeField(default=timezone.now)

    # This is for basic and custom serialisation to return it to client as a JSON.
    @property
    def to_dict(self):
        data = {
            'link_url': json.loads(self.link_url),
            'image_urls': json.loads(self.image_urls)
            #'date': self.date
        }
        return data

    def __str__(self):
        return self.unique_id