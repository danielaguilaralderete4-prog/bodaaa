import { GalleryPhoto } from '../types';
import galleryPierKiss from '../assets/images/gallery-pier-kiss.jpeg';
import galleryBeachPortrait from '../assets/images/gallery-beach-portrait.jpeg';

export const WEDDING_DETAILS = {
  brideName: 'Bárbara',
  groomName: 'Daniel',
  coupleTitle: 'Bárbara & Daniel',
  weddingDateFormatted: '12 de Diciembre, 2026',
  weddingDateISO: '2026-12-12T15:30:00',
  venueName: 'Centro eventos Matri',
  venueAddress: 'Ruta 215 7020, Osorno, Los Lagos, Chile',
  ceremonyTime: '15:30 Hrs',
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
