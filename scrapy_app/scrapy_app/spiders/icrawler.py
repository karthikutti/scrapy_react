# -*- coding: utf-8 -*-
import scrapy
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule
from urllib.parse import urljoin
from scrapy.selector import Selector

class IcrawlerSpider(CrawlSpider):
    name = 'icrawler'

    def __init__(self, *args, **kwargs):
        # We are going to pass these args from our django view.
        # To make everything dynamic, we need to override them inside __init__ method
        self.url = kwargs.get('url')
        self.domain = kwargs.get('domain')
        self.start_urls = [self.url]
        self.allowed_domains = [self.domain]

        IcrawlerSpider.rules = [
           Rule(LinkExtractor(unique=True), callback='parse_item'),
        ]
        super(IcrawlerSpider, self).__init__(*args, **kwargs)

    def parse_item(self, response):
        # You can tweak each crawled page here
        # Don't forget to return an object.
        # i = {} i['url'] = response.url return i
        content = Selector(response=response).xpath('//body')
        for nodes in content:
            # build absolute URLs
            img_urls = [urljoin(response.url, src)
                        for src in nodes.xpath('//img/@src').extract()]

            item = {}
            item['link_url'] = response.url
            item['image_urls'] = img_urls

            return item
