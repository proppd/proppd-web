-- Seed live Sakstons listings, resolving agency/agent/property-type by slug.
-- Idempotent: safe to re-run. Run AFTER the agents have been seeded.

insert into public.property_types (name, slug, category, sort_order) values
  ('Apartment', 'apartment', 'residential', 200),
  ('Cluster', 'cluster', 'residential', 210),
  ('House', 'house', 'residential', 220),
  ('Property', 'property', 'residential', 230)
on conflict (slug) do update set name = excluded.name, is_active = true;

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Villa Lane – 292 Bryanston Drive', 'sakstons-villa-lane-292-bryanston-drive', 'sale', 'available', 3299000, 'Stunning Three-Level Townhouse in Bryanston This immaculate three-level townhouse offers modern, secure living in a prime Bryanston estate, ideal for couples or young families. Features include: Secure estate with front-door security gate Double garage with laundry and extra storage Domestic Quarters with bathroom and ',
  'Bryanston', 'Sandton', 'Gauteng', 3, 4, 2, 250, null, true, now()
from public.property_types pt where pt.slug = 'cluster'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2026/03/unit-17-292-Bryanston-Dr-Bryanston-Marc-Saktons-L26.jpg', 'Villa Lane – 292 Bryanston Drive - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-villa-lane-292-bryanston-drive'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2026/03/unit-17-292-Bryanston-Dr-Bryanston-Marc-Saktons-L26.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Insignia Luxury Apartments', 'sakstons-insignia-luxury-apartments', 'rent', 'available', 17000, 'Immaculate, Fully-Furnished Unit with Private Garden – Ready to Move In (Sandown) Wake up in quiet, leafy Sandown just minutes from Sandton’s energy – this modern, move-in ready apartment offers a rare balance of sanctuary and connectedness, designed for both ease and enjoyment. Fully furnished and low maintenance, thi',
  'Sandton', 'Sandton', 'Gauteng', 2, 2, 0, 106, null, true, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2025/05/1.jpg', 'Insignia Luxury Apartments - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-insignia-luxury-apartments'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2025/05/1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Ultra Modern Cluster In Bryanston', 'sakstons-3-bedrooom-ultra-modern-cluster-in-bryanston', 'sale', 'available', 3300000, 'Introducing an exceptional 3-bedroom family home. This exquisite residence seamlessly marries contemporary design with comfort and opulence, boasting impeccable craftsmanship evident in every detail. From the tiled living areas to the elegant wooden floors adorning the bedrooms, every aspect of this home exudes sophist',
  'Sandton', 'Sandton', 'Gauteng', 3, 4, 0, 150, null, true, now()
from public.property_types pt where pt.slug = 'cluster'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2024/05/1-1.jpg', 'Ultra Modern Cluster In Bryanston - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-3-bedrooom-ultra-modern-cluster-in-bryanston'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2024/05/1-1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  '4 Bedroom Cluster – Sunninghill Gardens', 'sakstons-4-bedroom-cluster-sunninghill-gardens', 'sale', 'available', 2100000, 'Perfectly arranged, pristine, airy and secure enclave nestled in the heart of Sunninghill Gardens. Ideal for a family, this residence boasts ample, open-plan living spaces flooded with natural light and seamless transitions. Featuring a open-plan kitchen and lounge area. The expansive lounge and dining area effortlessl',
  'Sandton', 'Sandton', 'Gauteng', 4, 2, 0, 250, null, true, now()
from public.property_types pt where pt.slug = 'cluster'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2024/05/1.jpg', '4 Bedroom Cluster – Sunninghill Gardens - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-4-bedroom-cluster-sunninghill-gardens'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2024/05/1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Munyaka Lifestyle Estate – Waterfall City', 'sakstons-munyaka-lifestyle-estate-waterfall-city', 'rent', 'available', 17000, 'Experience luxury living in this ground floor apartment featuring three bedrooms with tastefully tiled floors, built-in cupboards, and two well-appointed bathrooms. The ensuite boasts a spacious shower, while the guest bathroom offers both a shower and a bathtub. Upon entering, you’ll find an inviting space that seamle',
  'Midrand', 'Midrand', 'Gauteng', 3, 2, 0, 120, null, true, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2024/01/20220307_143745_resized.jpg', 'Munyaka Lifestyle Estate – Waterfall City - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-munyaka-lifestyle-estate-waterfall-city'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2024/01/20220307_143745_resized.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Portman Place – Two Bedroom, Two Bathroom Apartment In Melrose', 'sakstons-portman-place-two-bedroom-two-bathroom-apartment-in-melrose', 'sale', 'available', 2500000, 'This gorgeous and newly renovated apartment is for sale in Portman Place, featuring a modern kitchen with an island. Two spacious bedrooms with built in cupboards and tiled flooring, two bathroom one being an en-suite to the main, open plan kitchen leading into an open plan dining and lounge area, which in turn leads t',
  'Melrose', 'Johannesburg', 'Gauteng', 2, 2, 0, 111, null, true, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/10/6-1.jpg', 'Portman Place – Two Bedroom, Two Bathroom Apartment In Melrose - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-portman-place-two-bedroom-two-bathroom-apartment-in-melrose'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/10/6-1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'GlenDouglas Complex – Douglasdale – Townhouse', 'sakstons-glendouglas-complex-douglasdale-townhouse', 'rent', 'available', 17000, 'Nestled in the heart of Douglasdale, this charming 2-bedroom, 2-bathroom townhouse presents a unique blend of modern comfort and convenient living. Located within a serene and well-maintained complex, this townhouse offers a peaceful retreat from the bustle of city life while providing easy access to urban amenities. S',
  'Douglasdale', 'Sandton', 'Gauteng', 2, 2, 0, 220, null, false, now()
from public.property_types pt where pt.slug = 'cluster'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/10/1.jpg', 'GlenDouglas Complex – Douglasdale – Townhouse - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-glendouglas-complex-douglasdale-townhouse'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/10/1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  '77 on Grayston – Modern 2 Bed 2 Bath – Apartment', 'sakstons-77-on-grayston-modern-2-bed-2-bath-apartment', 'rent', 'available', 12000, '2 bedroom apartment available for rent in the heart of Sandton CBD’s vibrant Hub. This unit is situated on the second floor and boasts a beautiful, expansive 114sqm space. The apartment features two bedrooms with elegant wooden flooring, accompanied by two full bathrooms, each en-suite. The kitchen is equipped with sle',
  'Sandton', 'Sandton', 'Gauteng', 2, 2, 0, 114, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/10/Screenshot-2023-10-16-084913.png', '77 on Grayston – Modern 2 Bed 2 Bath – Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-77-on-grayston-modern-2-bed-2-bath-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/10/Screenshot-2023-10-16-084913.png');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Baldersani – 2 bed 1 bath – Garden Apartment', 'sakstons-baldersani-2-bed-1-bath-garden-apartment', 'rent', 'available', 9500, 'Modern 2 Bedroom, 1 Bathroom Garden Apartment in Sunninghill This inviting 2-bedroom, 1-bathroom garden apartment in Sunninghill offers a spacious and contemporary living space! Features: • The living area is beautifully tiled and features stackable doors that open to a covered patio, providing a seamless transition to',
  'Sandton', 'Sandton', 'Gauteng', 2, 1, 0, 94, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/10/Screenshot-2023-10-05-113809.png', 'Baldersani – 2 bed 1 bath – Garden Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-baldersani-2-bed-1-bath-garden-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/10/Screenshot-2023-10-05-113809.png');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Georgian Terrace – 2 Bed 2 Bath – Garden Apartment – Morningside', 'sakstons-georgian-terrace-2-bed-2-bath-garden-apartment-morningside', 'rent', 'available', 10750, 'This stunning and spacious two-bedroom apartment in Morningside features a well-equipped kitchen with built-in cupboards, a pantry cupboard, microwave oven nook, double basin, and space for under-counter appliances, oven, and gas stove. The living area is generously sized and connects to a covered balcony through doubl',
  'Sandton', 'Sandton', 'Gauteng', 2, 2, 0, 110, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/08/20230803_143240_resized.jpg', 'Georgian Terrace – 2 Bed 2 Bath – Garden Apartment – Morningside - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-georgian-terrace-2-bed-2-bath-garden-apartment-morningside'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/08/20230803_143240_resized.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'graham-donald'),
  pt.id,
  'Luxury Living in Monaco: Superb Penthouse in Fontvieille with Panoramic Sea View', 'sakstons-luxury-living-in-monaco-superb-penthouse-in-fontvieille-with-panoramic-sea-view', 'sale', 'available', 26500000, 'This is a luxurious penthouse apartment located in the Port of Fontvieille, offering a panoramic view of the marina. It has been completely renovated using high-quality materials and is furnished with branded furniture. The apartment is in a unique position and is not overlooked, ensuring privacy and exclusivity. The a',
  'Sandton', 'Sandton', 'Gauteng', 3, 3, 2, 508, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/04/pic1Monaco.jpg', 'Luxury Living in Monaco: Superb Penthouse in Fontvieille with Panoramic Sea View - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-luxury-living-in-monaco-superb-penthouse-in-fontvieille-with-panoramic-sea-view'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/04/pic1Monaco.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: Three Bedroom Two Bathroom Apartment in Sandown', 'sakstons-rental-three-bedroom-two-bathroom-apartment-in-sandown', 'rent', 'available', 13000, 'This newly renovated top floor apartment is in the well-maintained complex of Sandown Palms. Perfectly located close to Mandela Square, Sandton City and the Gautrain station, highway and other amenities. Very safe and secure Three spacious bedrooms with ample cupboards and laminated flooring Two bathrooms with one bein',
  'Sandown', 'Sandton', 'Gauteng', 0, 0, 2, 95, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/03/1.jpg', 'Rental: Three Bedroom Two Bathroom Apartment in Sandown - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-three-bedroom-two-bathroom-apartment-in-sandown'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/03/1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Santana Sunninghill – 3 Bed Cluster', 'sakstons-santana-sunninghill-3-bed-cluster', 'rent', 'available', 23000, '3 bed 3 bath double storey townhouse. Neat and spacious double story stand alone a must see. Open plan lounge, dining room and kitchen. Lounge opens out onto a covered patio and a very large easy to maintain garden with perfect sized sparkling pool. downstairs study room and domestic quarters aircon in all the rooms la',
  'Sandton', 'Sandton', 'Gauteng', 3, 3, 2, 200, null, false, now()
from public.property_types pt where pt.slug = 'property'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/03/20220512_150126.jpg', 'Santana Sunninghill – 3 Bed Cluster - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-santana-sunninghill-3-bed-cluster'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/03/20220512_150126.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: The Avenues On Broadacres, Three Bedroom Cluster', 'sakstons-rental-the-avenues-on-broadacres-three-bedroom-cluster', 'rent', 'available', 25000, 'This modern gem is situated in the beautiful complex of The Avenues in Broadacres. Downstairs features an open plan lounge area leading out to a private patio with build in braai and private garden with a swimming pool; modern kitchen, dining area, guest toilet and fully automated double garage. Upstairs features three',
  'Broadacres', 'Sandton', 'Gauteng', 3, 2, 2, 110, null, false, now()
from public.property_types pt where pt.slug = 'cluster'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/03/property-9404819-75808182_sd.jpg', 'Rental: The Avenues On Broadacres, Three Bedroom Cluster - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-the-avenues-on-broadacres-three-bedroom-cluster'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/03/property-9404819-75808182_sd.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'The Kanyin – 2 bed 1 bath – Middle Floor Apartment', 'sakstons-the-kanyin-2-bed-1-bath-middle-floor-apartment-2', 'rent', 'available', 9000, 'The Kanyin boasts: a Clubhouse, a Fully Equipped Gym, Entertaining Area, Swimming Pool, Squash Courts, A Creche and 24 Hour Security. DESCRIPTION: • LOUNGE: Open plan spacious tiled with a sliding door leading out to the covered balcony with a built-in Braai. • KITCHEN: Open plan, granite tops, plenty of built-in cupbo',
  'Sandton', 'Sandton', 'Gauteng', 2, 1, 0, 91, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/03/Capture.jpg', 'The Kanyin – 2 bed 1 bath – Middle Floor Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-kanyin-2-bed-1-bath-middle-floor-apartment-2'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/03/Capture.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'The Kanyin – 2 Bed 2 Bath – Garden Apartment', 'sakstons-the-kanyin-2-bed-2-bath-garden-apartment-2', 'sale', 'available', 1400000, 'The Kanyin boasts: a Clubhouse, a Fully Equipped Gym, Entertaining Area, Swimming Pool, Squash Courts, A Creche and 24 Hour Security. DESCRIPTION: • LOUNGE: Open plan spacious tiled with a sliding door leading out to the covered balcony with a built-in braai with PET FRIENDLY garden. • KITCHEN: Open plan, granite tops,',
  'Sandton', 'Sandton', 'Gauteng', 2, 2, 0, 94, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/02/pic_33282230_640x480.jpg', 'The Kanyin – 2 Bed 2 Bath – Garden Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-kanyin-2-bed-2-bath-garden-apartment-2'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/02/pic_33282230_640x480.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Kalgaro Estate – 2 Bed 1 Bath – Middle Floor Apartment', 'sakstons-kalgaro-estate-2-bed-1-bath-middle-floor-apartment', 'rent', 'available', 7750, 'This contemporary, well finished and pet friendly (cats and dogs) ground floor apartment features two bedrooms with built in cupboards, tiled flooring and two bathrooms one being an en-suite to the main, an open plan kitchen with Caesar stone counter tops, there is space for an upright fridge, tumble dryer and washing ',
  'Sandton', 'Sandton', 'Gauteng', 2, 1, 0, 75, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/02/01.jpg', 'Kalgaro Estate – 2 Bed 1 Bath – Middle Floor Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-kalgaro-estate-2-bed-1-bath-middle-floor-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/02/01.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'The Atrium- Two Bedroom, One Bathroom Apartment', 'sakstons-the-atrium-two-bedroom-one-bathroom-apartment', 'rent', 'available', 12000, 'Spacious and modern middle floor apartment, featuring two bedrooms with built in cupboards and laminated flooring, one full bathroom (consisting of a bath/shower, basin and toilet), open plan kitchen leading into an open plan dining and lounge area, which in turn leads to a private and spacious balcony with stunning vi',
  'Rivonia', 'Sandton', 'Gauteng', 2, 1, 2, 100, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/property-9260685-19449718_sd.jpg', 'The Atrium- Two Bedroom, One Bathroom Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-atrium-two-bedroom-one-bathroom-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/property-9260685-19449718_sd.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: Three Bedroom Three Bathroom House In Westdene', 'sakstons-rental-three-bedroom-three-bathroom-house-in-westdene', 'rent', 'available', 22000, 'This newly renovated double storey house is situated in a quiet and secure road in Westdene. An entertainers dream. Pefectly located close to the freeway, public transport (Rea Vaya line), Melville, Campus Square, Westdene dam and parks, it is in close proximity to UJ, SABC, Helen Joseph Hospital & 5 km from Wits Unive',
  'Westdene', 'Johannesburg', 'Gauteng', 3, 3, 3, 205, 745, false, now()
from public.property_types pt where pt.slug = 'house'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/property-4766263-76699394_sd.jpg', 'Rental: Three Bedroom Three Bathroom House In Westdene - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-three-bedroom-three-bathroom-house-in-westdene'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/property-4766263-76699394_sd.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: Fully Furnished Two Bedroom One Bathroom Garden Apartment In Rivonia', 'sakstons-rental-fully-furnished-two-bedroom-one-bathroom-garden-apartment-in-rivonia', 'rent', 'available', 12500, 'This fully furnished two bedroom one bathroom ground floor apartment is situated in the well managed and popular complex of The Willows. Perfectly located close to all amenities and freeway. The complex has a communal swimming pool and braai facilities. Fully Furnished Two bedrooms with build in cupboards and carpeted ',
  'Rivonia', 'Sandton', 'Gauteng', 2, 1, 1, 100, 110, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/20230127_144712_resized.jpg', 'Rental: Fully Furnished Two Bedroom One Bathroom Garden Apartment In Rivonia - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-fully-furnished-two-bedroom-one-bathroom-garden-apartment-in-rivonia'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/20230127_144712_resized.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'graham-donald'),
  pt.id,
  'Cedar Acres Estate- Three Bedroom, Two Bathroom Middle Floor Apartment', 'sakstons-cedar-acres-estate-three-bedroom-two-bathroom-middle-floor-apartment', 'rent', 'available', 11000, 'This Beautiful middle floor apartment in a sought-after complex features three bedrooms and two bathrooms , an open plan kitchen has space for two undercounter appliance and an upright fridge, spacious lounge area. The apartment is fibre internet ready and has two undercover parkings. The complex features 24-hour acces',
  'Sandton', 'Sandton', 'Gauteng', 3, 2, 0, 107, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/1-2.jpg', 'Cedar Acres Estate- Three Bedroom, Two Bathroom Middle Floor Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-cedar-acres-estate-three-bedroom-two-bathroom-middle-floor-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/1-2.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'The Kanyin – 2 Bed 1 Bath – Middle Floor Apartment', 'sakstons-the-kanyin-2-bed-1-bath-middle-floor-apartment', 'sale', 'available', 1100000, 'The Kanyin boasts: a Clubhouse, a Fully Equipped Gym, Entertaining Area, Swimming Pool, Squash Courts, A Creche and 24 Hour Security. DESCRIPTION: • LOUNGE: Open plan spacious tiled with a sliding door leading out to the covered balcony with a built-in Braai. • KITCHEN: Open plan, granite tops, plenty of built-in cupbo',
  'Sandton', 'Sandton', 'Gauteng', 2, 1, 2, 90, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/1-Capture-1.jpg', 'The Kanyin – 2 Bed 1 Bath – Middle Floor Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-kanyin-2-bed-1-bath-middle-floor-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/1-Capture-1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: Four Bedroom, Four Bathrooms Fully Furnished Apartment in Strathavon.', 'sakstons-rental-four-bedroom-four-bathrooms-fully-furnished-apartment-in-strathavon', 'rent', 'available', 40000, 'This spacious and elegantly furnished double storey apartment is situated in the beautiful Forest Sandown. It has four spacious bedrooms and three bathrooms. Perfectly located close to all amenities and freeway. The complex is surrounded by nature giving a tranquil feeling. Fully Furnished Maximum of 7 people can occup',
  'Strathavon', 'Sandton', 'Gauteng', 4, 4, 2, 266, 466, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/property-6585481-37402327_sd-2.jpg', 'Rental: Four Bedroom, Four Bathrooms Fully Furnished Apartment in Strathavon. - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-four-bedroom-four-bathrooms-fully-furnished-apartment-in-strathavon'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/property-6585481-37402327_sd-2.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: Two Bedroom, Two Bathrooms Fully Furnished Apartment in Strathavon.', 'sakstons-rental-two-bedroom-two-bathrooms-fully-furnished-apartment-in-strathavon-2', 'rent', 'available', 22000, 'This spacious and beautifully furnished apartment is situated in the beautiful Forest Sandown. It has two spacious bedrooms and two bathrooms. Perfectly located close to all amenities and freeway. The complex is surrounded by nature giving a tranquil feeling. Fully Furnished Beautiful kitchen ample cupboard space and i',
  'Strathavon', 'Sandton', 'Gauteng', 2, 0, 1, 160, 160, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/property-7369469-15096636_sd.jpg', 'Rental: Two Bedroom, Two Bathrooms Fully Furnished Apartment in Strathavon. - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-two-bedroom-two-bathrooms-fully-furnished-apartment-in-strathavon-2'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/property-7369469-15096636_sd.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: Two Bedroom, Two Bathrooms Fully Furnished Apartment in Strathavon.', 'sakstons-rental-two-bedroom-two-bathrooms-fully-furnished-apartment-in-strathavon', 'rent', 'available', 24000, 'This spacious and elegantly furnished luxury apartment is situated in the beautiful Forest Sandown. It has two spacious bedrooms and two bathrooms. Perfectly located close to all amenities and freeway. The complex is surrounded by nature giving a tranquil feeling. Fully Furnished Beautiful kitchen ample cupboard space ',
  'Strathavon', 'Sandton', 'Gauteng', 2, 2, 1, 168, 238, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/property-6585481-37402327_sd-1.jpg', 'Rental: Two Bedroom, Two Bathrooms Fully Furnished Apartment in Strathavon. - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-two-bedroom-two-bathrooms-fully-furnished-apartment-in-strathavon'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/property-6585481-37402327_sd-1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'graham-donald'),
  pt.id,
  'Marina Vista- One Bedroom, One Bathroom Apartment', 'sakstons-marina-vista-one-bedroom-one-bathroom-apartment', 'rent', 'available', 12000, 'This Beautiful newly Renovated apartment perfectly located in a sought-after complex features one bedroom with a walk-in closet and one en suite bathroom, an open plan Dining room and lounge leading onto a spacious balcony, kitchen with space for one undercounter appliance and an upright fridge. The apartment is fibre ',
  'Parkmore', 'Sandton', 'Gauteng', 1, 1, 1, 67, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/1-1.jpg', 'Marina Vista- One Bedroom, One Bathroom Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-marina-vista-one-bedroom-one-bathroom-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/1-1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: Four Bedroom, Four Bathrooms Fully Furnished Cluster in Sandown.', 'sakstons-rental-four-bedroom-four-bathrooms-fully-furnished-cluster-in-sandown', 'rent', 'available', 40000, 'This spacious and beautifully furnished cluster is situated in the beautiful Royal Sandown. It has four spacious bedrooms, four en-suite bathrooms and a stunning indoor pool. Perfectly located close to all amenities and freeway. Very safe and secure. Fully Furnished Beautiful kitchen with separate scullery and pantry D',
  'Sandown', 'Sandton', 'Gauteng', 4, 4, 2, 480, 560, false, now()
from public.property_types pt where pt.slug = 'cluster'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/property-7364793-45943743_sd.jpg', 'Rental: Four Bedroom, Four Bathrooms Fully Furnished Cluster in Sandown. - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-four-bedroom-four-bathrooms-fully-furnished-cluster-in-sandown'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/property-7364793-45943743_sd.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'Rental: Four Bedroom, Three Bathroom Fully Furnished Apartment in Strathavon.', 'sakstons-rental-four-bedroom-three-bathroom-fully-furnished-apartment-in-strathavon', 'rent', 'available', 30000, 'This spacious and elegantly furnished double storey apartment is situated in the beautiful Forest Sandown. It has four spacious bedrooms and three bathrooms. Perfectly located close to all amenities and freeway. The complex is surrounded by nature giving a tranquil feeling. Fully Furnished Maximum of 7 people can occup',
  'Strathavon', 'Sandton', 'Gauteng', 4, 3, 1, 185, 228, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/property-6585481-37402327_sd.jpg', 'Rental: Four Bedroom, Three Bathroom Fully Furnished Apartment in Strathavon. - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-rental-four-bedroom-three-bathroom-fully-furnished-apartment-in-strathavon'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/property-6585481-37402327_sd.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'The Kanyin – 2 Bed 2 Bath – Garden Apartment', 'sakstons-the-kanyin-2-bed-2-bath-garden-apartment', 'rent', 'available', 11000, 'The Kanyin boasts: a Clubhouse, a Fully Equipped Gym, Entertaining Area, Swimming Pool, Squash Courts, A Creche and 24 Hour Security. DESCRIPTION: • LOUNGE: Open plan spacious tiled with a sliding door leading out to the covered balcony with a built-in braai and pet friendly garden. • KITCHEN: Open plan, granite tops, ',
  'Sandton', 'Sandton', 'Gauteng', 2, 2, 0, 91, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/01.-2.jpg', 'The Kanyin – 2 Bed 2 Bath – Garden Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-kanyin-2-bed-2-bath-garden-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/01.-2.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'The Kanyin – 1 Bed 1 Bath – Top Floor Apartment', 'sakstons-the-kanyin-1-bed-1-bath-top-floor-apartment', 'sale', 'available', 900000, 'The Kanyin boasts: a Clubhouse, a Fully Equipped Gym, Entertaining Area, Swimming Pool, Squash Courts, A Creche and 24 Hour Security. DESCRIPTION: • LOUNGE: Open plan spacious tiled with a sliding door leading out to the covered balcony with a built-in Braai. • KITCHEN: Open plan, granite tops, plenty of built-in cupbo',
  'Sandton', 'Sandton', 'Gauteng', 1, 1, 0, 60, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/01.-1.jpg', 'The Kanyin – 1 Bed 1 Bath – Top Floor Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-kanyin-1-bed-1-bath-top-floor-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/01.-1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'The Kanyin – 2 Bed 2 Bath – Middle Floor Apartment', 'sakstons-the-kanyin-2-bed-2-bath-middle-floor-apartment', 'rent', 'available', 10000, 'The Kanyin boasts: a Clubhouse, a Fully Equipped Gym, Entertaining Area, Swimming Pool, Squash Courts, A Creche and 24 Hour Security. DESCRIPTION: • LOUNGE: Open plan spacious tiled with a sliding door leading out to the covered balcony with a built-in Braai. • KITCHEN: Open plan, granite tops, plenty of built-in cupbo',
  'Sandton', 'Sandton', 'Gauteng', 2, 2, 0, 91, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/Capture-1.jpg', 'The Kanyin – 2 Bed 2 Bath – Middle Floor Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-kanyin-2-bed-2-bath-middle-floor-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/Capture-1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'liz-marx'),
  pt.id,
  'THE MATRIX – One Bedroom, One Bathroom MIDDLE Apartment', 'sakstons-the-matrix-one-bedroom-one-bathroom-middle-apartment', 'rent', 'available', 6800, 'This modern and spacious open plan middle floor apartment features one bedroom with built in cupboards and carpeted flooring, one full bathroom, an open plan kitchen, leading into the dining / lounge area and a private, shaded balcony on the lower level. The lounge setup with communal DSTV connections. The apartment is',
  'Paulshof', 'Sandton', 'Gauteng', 1, 1, 0, 45, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/01-13.jpg', 'THE MATRIX – One Bedroom, One Bathroom MIDDLE Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-matrix-one-bedroom-one-bathroom-middle-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/01-13.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'graham-donald'),
  pt.id,
  'HYRDO PARK – One Bedroom, One Bathroom SECOND FLOOR Apartment', 'sakstons-hyrdo-park-one-bedroom-one-bathroom-second-floor-apartment-2', 'rent', 'available', 8000, 'This ideally located and spacious second floor open plan apartment features one bedroom with built in cupboards and tiled flooring, one full bathroom en suite and a separate guest toilet, an open plan kitchen with a space for an upright fridge and one under counter appliance, leading into the dining / lounge area and a',
  'Sandton', 'Sandton', 'Gauteng', 1, 2, 1, 54, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/01-12.jpg', 'HYRDO PARK – One Bedroom, One Bathroom SECOND FLOOR Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-hyrdo-park-one-bedroom-one-bathroom-second-floor-apartment-2'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/01-12.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'graham-donald'),
  pt.id,
  'THE WILLIAM – Two Bedroom and Two Bathroom SECOND FLOOR Apartment', 'sakstons-the-william-two-bedroom-and-two-bathroom-second-floor-apartment', 'rent', 'available', 9000, 'This contemporary, well finished and pet friendly (cats only, no dogs) second floor apartment features two bedroom’s with built in cupboards, tiled flooring, an en suite bathroom off the main bedroom, one full guest bathroom, an open plan kitchen with Caesar stone counter tops, a gas hob, an upright fridge, dishwasher,',
  'Midrand', 'Midrand', 'Gauteng', 2, 2, 0, 85, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/01-7.jpg', 'THE WILLIAM – Two Bedroom and Two Bathroom SECOND FLOOR Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-william-two-bedroom-and-two-bathroom-second-floor-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/01-7.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'The Kanyin – 3 Bed 2 Bath – Loft Apartment', 'sakstons-the-kanyin-3-bed-2-bath-loft-apartment', 'rent', 'available', 1550000, '3 Bed 2 Bath – Loft Apartment The Kanyin boasts: a Clubhouse, a Fully Equipped Gym, Entertaining Area, Swimming Pool, Squash Courts, A Creche and 24 Hour Security. DESCRIPTION: • LOUNGE: Open plan spacious tiled with a sliding door leading out to the covered balcony with a built-in Braai. • LOFT: Large loft area upstai',
  'Sunninghill', 'Sandton', 'Gauteng', 3, 2, 2, 150, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/Capture.jpg', 'The Kanyin – 3 Bed 2 Bath – Loft Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-kanyin-3-bed-2-bath-loft-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/Capture.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'Hydra Complex – 2 Bed 1 Bath – Townhouse – Wilgeheuwel', 'sakstons-hydra-complex-wilgeheuwel', 'rent', 'available', 8000, 'Perfectly positioned close to all the good schools and shopping malls. Offering 2 bedrooms 1 full bathroom, Open plan tiled kitchen and lounge and large pet friendly garden. Double garage.',
  'Roodepoort', 'Roodepoort', 'Gauteng', 2, 1, 0, 85, null, false, now()
from public.property_types pt where pt.slug = 'house'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/Capture1.jpg', 'Hydra Complex – 2 Bed 1 Bath – Townhouse – Wilgeheuwel - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-hydra-complex-wilgeheuwel'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/Capture1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'graham-donald'),
  pt.id,
  'The William – 1 Bed 1 Bath – Top Floor Apartment', 'sakstons-the-william-1-bed-1-bath-top-floor-apartment', 'rent', 'available', 7000, 'Situated in the secure and sought-after complex of The William in Dainfern, this modern apartment features one bedroom with built in cupboards and one bathroom, an open plan kitchen featuring an electric hob. Leading into the dining and lounge areas. A small balcony runs the length of the apartment, with direct access ',
  'Fourways', 'Midrand', 'Gauteng', 1, 1, 0, 45, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/1.jpg', 'The William – 1 Bed 1 Bath – Top Floor Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-william-1-bed-1-bath-top-floor-apartment'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/1.jpg');

insert into public.listings (agency_id, agent_id, property_type_id, title, slug, purpose, status, price, description, suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, erf_size_sqm, is_featured, published_at)
select
  (select id from public.agencies where slug = 'sakstons'),
  (select id from public.agents where slug = 'mark-chait'),
  pt.id,
  'The Kanyin – 2 Bed 1 Bath – Garden Apartment', 'sakstons-the-kanyin-2-bed-1-bath-garden-apartment-2', 'rent', 'available', 10500, 'The Kanyin boasts: a Clubhouse, a Fully Equipped Gym, Entertaining Area, Swimming Pool, Squash Courts, A Creche and 24 Hour Security. DESCRIPTION: • LOUNGE: Open plan spacious tiled with a sliding door leading out to the covered balcony with a built-in Braai and pet friendly garden • KITCHEN: Open plan, granite tops, p',
  'Sunninghill', 'Sandton', 'Gauteng', 2, 1, 0, 90, null, false, now()
from public.property_types pt where pt.slug = 'apartment'
on conflict (slug) do update set
  agency_id = excluded.agency_id, agent_id = excluded.agent_id, property_type_id = excluded.property_type_id,
  price = excluded.price, status = excluded.status, is_featured = excluded.is_featured,
  published_at = coalesce(public.listings.published_at, now());
insert into public.listing_images (listing_id, image_url, alt_text, sort_order, is_cover)
select l.id, 'https://www.sakstons.com/wp-content/uploads/2023/01/01..jpg', 'The Kanyin – 2 Bed 1 Bath – Garden Apartment - Sakstons source image', 0, true
from public.listings l where l.slug = 'sakstons-the-kanyin-2-bed-1-bath-garden-apartment-2'
  and not exists (select 1 from public.listing_images i where i.listing_id = l.id and i.image_url = 'https://www.sakstons.com/wp-content/uploads/2023/01/01..jpg');

