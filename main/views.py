from django.views.generic import TemplateView
from booking.models import EscapeRoom


class HomeView(TemplateView):
    template_name = 'main/home.html'


class AboutView(TemplateView):
    template_name = 'main/about.html'


class KontactView(TemplateView):
    template_name = 'main/kontact.html'


class DetailsView(TemplateView):
    template_name = 'main/details.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['escape_rooms'] = EscapeRoom.objects.all()
        return context


class TombView(TemplateView):
    template_name = 'main/tomb.html'


class LabView(TemplateView):
    template_name = 'main/lab.html'


class AlcatrazView(TemplateView):
    template_name = 'main/alcatraz.html'


home = HomeView.as_view()
about = AboutView.as_view()
kontact = KontactView.as_view()
details = DetailsView.as_view()
tomb = TombView.as_view()
lab = LabView.as_view()
alcatraz = AlcatrazView.as_view()
