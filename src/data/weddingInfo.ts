import { TimelineEvent, GalleryPhoto } from '../types';
import storyWalk from '../assets/images/story-walk.jpeg';
import storyKiss from '../assets/images/story-kiss.jpeg';
import storyEmbrace from '../assets/images/story-embrace.jpeg';
import storyBridgeKiss from '../assets/images/story-bridge-kiss.jpeg';
import storyLakeside from '../assets/images/story-lakeside.jpeg';
import storyLanterns from '../assets/images/story-lanterns.jpeg';
import storyDance from '../assets/images/story-dance.jpeg';
import storyGazebo from '../assets/images/story-gazebo.jpeg';

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

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'p1',
    url: storyWalk,
    alt: 'Bárbara y Daniel en su sesión de compromiso formal',
    caption: 'Nuestro compromiso en el jardín histórico',
    span: 'col-span-2 md:col-span-2 h-72 md:h-84'
  },
  {
    id: 'p2',
    url: storyKiss,
    alt: 'Detalle de las manos entrelazadas y anillos',
    caption: 'La promesa que nos une para siempre',
    span: 'col-span-1 h-72 md:h-84'
  },
  {
    id: 'p3',
    url: storyEmbrace,
    alt: 'Retrato artístico blanco y negro caminando juntos',
    caption: 'Caminando juntos hacia nuestro futuro',
    span: 'col-span-1 h-72 md:h-84'
  },
  {
    id: 'p4',
    url: storyBridgeKiss,
    alt: 'Celebración y sonrisas de los novios',
    caption: 'La felicidad de compartir cada día',
    span: 'col-span-1 md:col-span-2 h-72 md:h-84'
  },
  {
    id: 'p5',
    url: storyLakeside,
    alt: 'Bárbara y Daniel junto al lago',
    caption: 'Nuestro horizonte compartido',
    span: 'col-span-1 h-72 md:h-84'
  },
  {
    id: 'p6',
    url: storyLanterns,
    alt: 'Bárbara y Daniel frente al lago',
    caption: 'Un instante para guardar',
    span: 'col-span-1 h-72 md:h-84'
  },
  {
    id: 'p7',
    url: storyDance,
    alt: 'Bárbara y Daniel bailando en el muelle',
    caption: 'Bailar la vida juntos',
    span: 'col-span-1 h-72 md:h-84'
  },
  {
    id: 'p8',
    url: storyGazebo,
    alt: 'Bárbara y Daniel de espaldas frente al lago',
    caption: 'Siempre del mismo lado',
    span: 'col-span-1 h-72 md:h-84'
  }
];
