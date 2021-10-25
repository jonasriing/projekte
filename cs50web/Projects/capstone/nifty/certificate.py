from fpdf import FPDF
from django.core.files.storage import default_storage

pdf_h=210
pdf_w=297

class PDF(FPDF):
    def imagex(self):
        self.set_xy(0.0,0.0)
        self.image(default_storage.path(f"c/CERTIFICATE.png"),  link='', type='', w=pdf_w, h=pdf_h*0.9) # [Errno 2] No such file or directory: '/c/CERTIFICATE.png'

    def name(self, name):
        self.set_xy(0.0,85.0)
        self.add_font('OpenSansLight', '', default_storage.path(f"c/OpenSans-Light.ttf"), uni=True)
        self.set_font('OpenSansLight', '', 25)
        self.set_text_color(0, 0, 0)
        self.cell(w=pdf_w, h=30, align='C', txt=f"{name}", border=0)
    

    def course(self, course):
        self.set_xy(0.0,115.0)
        self.add_font('OpenSansLight', '', default_storage.path(f"c/OpenSans-Light.ttf"), uni=True)
        self.set_font('OpenSansLight', '', 25)
        self.set_text_color(0, 0, 0)
        self.cell(w=pdf_w, h=30, align='C', txt=f"{course}.", border=0)


    def certificate_id(self, id):
        self.set_xy(0.0,167.0)
        self.add_font('OpenSansLight', '', default_storage.path(f"c/OpenSans-Light.ttf"), uni=True)
        self.set_font('OpenSansLight', '', 9)
        self.set_text_color(0, 0, 0)
        self.cell(w=pdf_w, h=20, align='C', txt=f"Certificate-ID: {id}.", border=0)


def new_certificate(name, course, id):
    file = PDF(orientation='L', unit='mm')
    file.add_page()
    file.imagex()
    file.name(name)
    file.course(course)
    file.certificate_id(id)
    
    file.output(f"certificates/{id}.pdf", "F")

