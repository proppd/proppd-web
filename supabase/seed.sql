-- Proppd local/demo seed data. Safe to run after the initial schema migration.

insert into public.property_types (name, slug, category, sort_order) values
  ('House', 'house', 'residential', 10),
  ('Apartment', 'apartment', 'residential', 20),
  ('Townhouse', 'townhouse', 'residential', 30),
  ('Vacant Land', 'vacant-land', 'land', 40),
  ('Farm', 'farm', 'agricultural', 50),
  ('Commercial', 'commercial', 'commercial', 60),
  ('Industrial', 'industrial', 'industrial', 70),
  ('Office', 'office', 'commercial', 80),
  ('Retail', 'retail', 'commercial', 90),
  ('Development', 'development', 'development', 100),
  ('Room / Share', 'room-share', 'residential', 110)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.locations (suburb, city, province, slug, latitude, longitude) values
  ('Sandton', 'Johannesburg', 'Gauteng', 'sandton-johannesburg', -26.1076, 28.0567),
  ('Sea Point', 'Cape Town', 'Western Cape', 'sea-point-cape-town', -33.9180, 18.3890),
  ('Umhlanga', 'Durban', 'KwaZulu-Natal', 'umhlanga-durban', -29.7260, 31.0850),
  ('Brooklyn', 'Pretoria', 'Gauteng', 'brooklyn-pretoria', -25.7717, 28.2334)
on conflict (slug) do update set
  suburb = excluded.suburb,
  city = excluded.city,
  province = excluded.province,
  latitude = excluded.latitude,
  longitude = excluded.longitude;

insert into public.agencies (id, name, slug, description, email, phone, city, province, is_verified) values
  ('11111111-1111-4111-8111-111111111111', 'Proppd Verified Realty', 'proppd-verified-realty', 'Demo verified agency for Proppd preview listings.', 'info@proppd.com', '+27 10 000 0000', 'Johannesburg', 'Gauteng', true),
  ('22222222-2222-4222-8222-222222222222', 'Atlantic Property Co.', 'atlantic-property-co', 'Cape Town coastal property specialists.', 'hello@atlantic.example', '+27 21 000 0000', 'Cape Town', 'Western Cape', true),
  ('33333333-3333-4333-8333-333333333333', 'Coastal Living', 'coastal-living', 'KwaZulu-Natal residential and rental agency.', 'hello@coastal.example', '+27 31 000 0000', 'Durban', 'KwaZulu-Natal', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  email = excluded.email,
  phone = excluded.phone,
  city = excluded.city,
  province = excluded.province,
  is_verified = excluded.is_verified;

insert into public.agents (id, agency_id, name, slug, email, phone, whatsapp, bio, areas_served, is_verified) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Lerato Mokoena', 'lerato-mokoena', 'lerato@example.com', '+27 82 123 4567', '+27 82 123 4567', 'Modern Johannesburg agent focused on verified buyer enquiries.', array['Sandton', 'Bryanston', 'Morningside'], true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Mia Jacobs', 'mia-jacobs', 'mia@example.com', '+27 82 234 5678', '+27 82 234 5678', 'Atlantic Seaboard rentals and apartments.', array['Sea Point', 'Green Point', 'Clifton'], true),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 'Aiden Naidoo', 'aiden-naidoo', 'aiden@example.com', '+27 82 345 6789', '+27 82 345 6789', 'Durban North Coast family homes and townhouses.', array['Umhlanga', 'La Lucia', 'Ballito'], true)
on conflict (slug) do update set
  agency_id = excluded.agency_id,
  name = excluded.name,
  email = excluded.email,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  bio = excluded.bio,
  areas_served = excluded.areas_served,
  is_verified = excluded.is_verified;

insert into public.listings (
  id, agency_id, agent_id, property_type_id, location_id, title, slug, purpose, status, price, description,
  suburb, city, province, bedrooms, bathrooms, parking, erf_size_sqm, floor_size_sqm, is_pet_friendly,
  is_furnished, is_featured, published_at
)
select
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  pt.id,
  loc.id,
  'Modern 3-bedroom house in Sandton',
  'modern-3-bedroom-house-in-sandton-12345',
  'sale',
  'available',
  3250000,
  'A polished family home close to Sandton business and lifestyle routes.',
  'Sandton', 'Johannesburg', 'Gauteng', 3, 2, 2, 620, 240, true, false, true, now()
from public.property_types pt, public.locations loc
where pt.slug = 'house' and loc.slug = 'sandton-johannesburg'
on conflict (slug) do update set price = excluded.price, status = excluded.status, is_featured = excluded.is_featured;

insert into public.listings (
  id, agency_id, agent_id, property_type_id, location_id, title, slug, purpose, status, price, description,
  suburb, city, province, bedrooms, bathrooms, parking, floor_size_sqm, is_pet_friendly, is_furnished, is_featured, published_at
)
select
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  '22222222-2222-4222-8222-222222222222',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  pt.id,
  loc.id,
  'Sea Point apartment with secure parking',
  'sea-point-apartment-with-parking-20401',
  'rent',
  'available',
  18500,
  'Light, secure apartment near the promenade with fast enquiry routing.',
  'Sea Point', 'Cape Town', 'Western Cape', 2, 2, 1, 86, false, true, true, now()
from public.property_types pt, public.locations loc
where pt.slug = 'apartment' and loc.slug = 'sea-point-cape-town'
on conflict (slug) do update set price = excluded.price, status = excluded.status, is_featured = excluded.is_featured;

insert into public.listings (
  id, agency_id, agent_id, property_type_id, location_id, title, slug, purpose, status, price, description,
  suburb, city, province, bedrooms, bathrooms, parking, erf_size_sqm, floor_size_sqm, is_pet_friendly,
  is_furnished, is_featured, published_at
)
select
  'ffffffff-ffff-4fff-8fff-ffffffffffff',
  '33333333-3333-4333-8333-333333333333',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  pt.id,
  loc.id,
  'Family townhouse in Umhlanga',
  'family-townhouse-in-umhlanga-77120',
  'sale',
  'available',
  2150000,
  'A neat lock-up-and-go townhouse for North Coast families.',
  'Umhlanga', 'Durban', 'KwaZulu-Natal', 3, 2, 2, 280, 160, true, false, true, now()
from public.property_types pt, public.locations loc
where pt.slug = 'townhouse' and loc.slug = 'umhlanga-durban'
on conflict (slug) do update set price = excluded.price, status = excluded.status, is_featured = excluded.is_featured;

insert into public.listing_features (listing_id, feature)
select id, feature
from public.listings
cross join unnest(array['Verified listing', 'Agent response path', 'POPIA-ready enquiry']) as feature
on conflict do nothing;
