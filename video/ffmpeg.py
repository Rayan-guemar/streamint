from django.core.files import File

UPLOAD_PATH='../uploads'


def write_file(file:File):
    name = file.name
    with open(UPLOAD_PATH.join("/").join(name), "wb") as f:
        for chunk in file.chunks():
            f.write(chunk)

