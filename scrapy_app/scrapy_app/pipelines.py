# -*- coding: utf-8 -*-

# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://doc.scrapy.org/en/latest/topics/item-pipeline.html

from main.models import ScrapyItem
import json

class ScrapyAppPipeline(object):
    def __init__(self, unique_id, *args, **kwargs):
        self.unique_id = unique_id
        self.link_url = []
        self.image_urls = []

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            unique_id=crawler.settings.get('unique_id'), # this will be passed from django view
        )

    def close_spider(self, spider):
        # And here we are saving our crawled data with django models.
        item = ScrapyItem()
        item.unique_id = self.unique_id
        item.link_url = json.dumps(self.link_url)
        item.image_urls = json.dumps(self.image_urls)
        item.save()

    def process_item(self, item, spider):
        self.link_url.append(item['link_url'])
        item['image_urls'] = list(set(item['image_urls']))
        self.image_urls.append(item['image_urls'])
        self.image_urls = list(set(self.image_urls))
        return item