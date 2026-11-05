from django.http import HttpResponse
from django.shortcuts import render
from django.template import loader


def test(request):
    return HttpResponse("test")


def create_stream(request):
    template = loader.get_template("appstreamint/create_stream.html")
    return HttpResponse(template.render({}, request))