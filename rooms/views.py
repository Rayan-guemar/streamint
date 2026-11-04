from django.shortcuts import render

# Create your views here.
def render_landing(request):
    return render(request, 'rooms/index.html')
