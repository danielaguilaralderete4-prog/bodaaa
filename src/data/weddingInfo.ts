import { TimelineEvent, GalleryPhoto } from '../types';
import galleryPierKiss from '../assets/images/gallery-pier-kiss.jpeg';
import galleryBeachPortrait from '../assets/images/gallery-beach-portrait.jpeg';

export const WEDDING_DETAILS = {
  brideName: 'Bárbara',
  groomName: 'Daniel',
  coupleTitle: 'Bárbara & Daniel',
  weddingDateFormatted: '12 de Diciembre, 2026',
  weddingDateISO: '2026-12-12T16:00:00',
  venueName: 'Centro eventos Matri',
  venueAddress: 'Ruta 215 7020, Osorno, Los Lagos, Chile',
  ceremonyTime: '16:00 Hrs',
  rsvpDeadline: '12 de Octubre, 2026',
  googleMapsUrl: 'https://maps.app.goo.gl/h3vNFbHpCvgvdFx27',
  parisNoviosUrl: 'https://club.noviosparis.cl/home/couple-catalog/21054461',
  parisNoviosCode: '21054461',
  contactWhatsApp: '+56954401828'
};

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'p1',
    url: galleryPierKiss,
    alt: 'Bárbara y Daniel besándose en el muelle',
    caption: 'Un amor que celebra cada instante',
    span: 'col-span-1 sm:col-span-2'
  },
  {
    id: 'p2',
    url: galleryBeachPortrait,
    alt: 'Bárbara y Daniel junto al lago',
    caption: 'Siempre juntos frente al horizonte',
    span: 'col-span-1'
  }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: '16:00',
    title: 'Ceremonia Religiosa',
    description: 'Nuestra bendición y el intercambio de votos de amor eterno en el altar.',
    iconName: 'church'
  },
  {
    time: '18:00',
    title: 'Cóctel de Bienvenida & Fotografías',
    description: 'Espumante, aperitivos sureños y música acústica en vivo mientras cae el atardecer.',
    iconName: 'local_bar'
  },
  {
    time: '19:30',
    title: 'Cena',
    description: 'Cena de tres tiempos con maridaje especial, rodeados de nuestras familias y amigos.',
    iconName: 'restaurant'
  },
  {
    time: '22:00',
    title: 'Vals de los Novios & Brindis',
    description: 'El primer baile como marido y mujer junto a emotivas palabras de nuestros padrinos.',
    iconName: 'celebration'
  },
  {
    time: '22:45',
    title: 'Gran Fiesta y Baile',
    description: '¡A celebrar toda la noche con la mejor música, cotillón y sorpresas hasta el amanecer!',
    iconName: 'nightlife'
  }
];
