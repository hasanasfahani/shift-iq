-- ============================================================
-- Shift.iq — Demo Seed Script
-- Run in Supabase SQL Editor (postgres role, bypasses RLS)
-- Password for ALL accounts: ShiftDemo2026!
--
-- Auth uses phantom emails derived from phone numbers:
--   phoneToEmail(normalizePhone('07XXXXXXXX')) → '964XXXXXXXX@auth.shiftiq.app'
--
-- Demo login credentials (use on the login page with phone field):
--   Pro   → phone: 07901234511  (Ahmad Al-Hassan)
--   Biz   → phone: 07901234501  (Al-Rasheed Grand Hotel)
--   Password: ShiftDemo2026!
-- ============================================================

-- ─── 1. CLEAN ALL EXISTING DATA ──────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications')      THEN DELETE FROM notifications; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='ratings')            THEN DELETE FROM ratings; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='applications')       THEN DELETE FROM applications; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='shift_templates')    THEN DELETE FROM shift_templates; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='shifts')             THEN DELETE FROM shifts; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='pro_experiences')    THEN DELETE FROM pro_experiences; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='business_locations') THEN DELETE FROM business_locations; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='pro_profiles')       THEN DELETE FROM pro_profiles; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='business_profiles')  THEN DELETE FROM business_profiles; END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='users')              THEN DELETE FROM users; END IF;
END $$;
DELETE FROM auth.identities;
DELETE FROM auth.users;

-- ─── 2. AUTH USERS ───────────────────────────────────────────

INSERT INTO auth.users
  (id, instance_id, aud, role, email, encrypted_password,
   email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
   is_super_admin, is_sso_user, is_anonymous, created_at, updated_at)
VALUES
  -- Businesses (phone → phantom email: 07901234501 → 9647901234501@auth.shiftiq.app)
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647901234501@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647901234502@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647501234503@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647701234504@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647701234505@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  -- Pros (phone → phantom email: 07901234511 → 9647901234511@auth.shiftiq.app)
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647901234511@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647901234512@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647901234513@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647501234514@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647901234515@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647501234516@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647701234517@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647901234518@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647701234519@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW()),
  ('20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000000','authenticated','authenticated','9647901234520@auth.shiftiq.app',crypt('ShiftDemo2026!',gen_salt('bf',10)),NOW(),'{"provider":"email","providers":["email"]}','{}',false,false,false,NOW(),NOW());

-- ─── 3. AUTH IDENTITIES ──────────────────────────────────────

INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('9647901234501@auth.shiftiq.app','10000000-0000-0000-0000-000000000001','{"sub":"10000000-0000-0000-0000-000000000001","email":"9647901234501@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647901234502@auth.shiftiq.app','10000000-0000-0000-0000-000000000002','{"sub":"10000000-0000-0000-0000-000000000002","email":"9647901234502@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647501234503@auth.shiftiq.app','10000000-0000-0000-0000-000000000003','{"sub":"10000000-0000-0000-0000-000000000003","email":"9647501234503@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647701234504@auth.shiftiq.app','10000000-0000-0000-0000-000000000004','{"sub":"10000000-0000-0000-0000-000000000004","email":"9647701234504@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647701234505@auth.shiftiq.app','10000000-0000-0000-0000-000000000005','{"sub":"10000000-0000-0000-0000-000000000005","email":"9647701234505@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647901234511@auth.shiftiq.app','20000000-0000-0000-0000-000000000001','{"sub":"20000000-0000-0000-0000-000000000001","email":"9647901234511@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647901234512@auth.shiftiq.app','20000000-0000-0000-0000-000000000002','{"sub":"20000000-0000-0000-0000-000000000002","email":"9647901234512@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647901234513@auth.shiftiq.app','20000000-0000-0000-0000-000000000003','{"sub":"20000000-0000-0000-0000-000000000003","email":"9647901234513@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647501234514@auth.shiftiq.app','20000000-0000-0000-0000-000000000004','{"sub":"20000000-0000-0000-0000-000000000004","email":"9647501234514@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647901234515@auth.shiftiq.app','20000000-0000-0000-0000-000000000005','{"sub":"20000000-0000-0000-0000-000000000005","email":"9647901234515@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647501234516@auth.shiftiq.app','20000000-0000-0000-0000-000000000006','{"sub":"20000000-0000-0000-0000-000000000006","email":"9647501234516@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647701234517@auth.shiftiq.app','20000000-0000-0000-0000-000000000007','{"sub":"20000000-0000-0000-0000-000000000007","email":"9647701234517@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647901234518@auth.shiftiq.app','20000000-0000-0000-0000-000000000008','{"sub":"20000000-0000-0000-0000-000000000008","email":"9647901234518@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647701234519@auth.shiftiq.app','20000000-0000-0000-0000-000000000009','{"sub":"20000000-0000-0000-0000-000000000009","email":"9647701234519@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW()),
  ('9647901234520@auth.shiftiq.app','20000000-0000-0000-0000-000000000010','{"sub":"20000000-0000-0000-0000-000000000010","email":"9647901234520@auth.shiftiq.app","email_verified":true}','email',NOW(),NOW(),NOW());

-- ─── 4. USERS (public) ───────────────────────────────────────

INSERT INTO users (id, full_name, first_name, last_name, phone, role, city, date_of_birth)
VALUES
  ('10000000-0000-0000-0000-000000000001','Khalid Al-Rasheed','Khalid','Al-Rasheed','+9647901234501','business','Baghdad','1980-03-15'),
  ('10000000-0000-0000-0000-000000000002','Nadia Hassoun','Nadia','Hassoun','+9647901234502','business','Baghdad','1985-07-22'),
  ('10000000-0000-0000-0000-000000000003','Soran Mustafa','Soran','Mustafa','+9647501234503','business','Erbil','1979-11-08'),
  ('10000000-0000-0000-0000-000000000004','Basim Al-Tamimi','Basim','Al-Tamimi','+9647701234504','business','Basra','1975-04-30'),
  ('10000000-0000-0000-0000-000000000005','Dara Karim','Dara','Karim','+9647701234505','business','Sulaymaniyah','1982-09-12'),
  ('20000000-0000-0000-0000-000000000001','Ahmad Al-Hassan','Ahmad','Al-Hassan','+9647901234511','pro','Baghdad','1995-06-20'),
  ('20000000-0000-0000-0000-000000000002','Fatima Karimi','Fatima','Karimi','+9647901234512','pro','Baghdad','1998-02-14'),
  ('20000000-0000-0000-0000-000000000003','Omar Abdullah','Omar','Abdullah','+9647901234513','pro','Baghdad','1993-08-05'),
  ('20000000-0000-0000-0000-000000000004','Sara Mahmoud','Sara','Mahmoud','+9647501234514','pro','Erbil','1997-11-30'),
  ('20000000-0000-0000-0000-000000000005','Hassan Al-Jubouri','Hassan','Al-Jubouri','+9647901234515','pro','Baghdad','1990-04-18'),
  ('20000000-0000-0000-0000-000000000006','Noor Ibrahim','Noor','Ibrahim','+9647501234516','pro','Erbil','1999-07-25'),
  ('20000000-0000-0000-0000-000000000007','Ali Karim','Ali','Karim','+9647701234517','pro','Basra','1994-12-10'),
  ('20000000-0000-0000-0000-000000000008','Rania Al-Saadi','Rania','Al-Saadi','+9647901234518','pro','Baghdad','1996-03-08'),
  ('20000000-0000-0000-0000-000000000009','Karwan Aziz','Karwan','Aziz','+9647701234519','pro','Sulaymaniyah','1992-09-22'),
  ('20000000-0000-0000-0000-000000000010','Lina Mohammed','Lina','Mohammed','+9647901234520','pro','Baghdad','2000-01-15');

-- ─── 5. BUSINESS PROFILES ────────────────────────────────────

INSERT INTO business_profiles (user_id, business_name, business_type, description, is_verified, average_rating, total_ratings)
VALUES
  ('10000000-0000-0000-0000-000000000001','Al-Rasheed Grand Hotel','Hotel',
   'Baghdad''s premier 5-star hotel since 1982. We host heads of state, international conferences, and the finest banquets in Iraq. Our F&B team sets the standard for hospitality excellence.',
   true,4.7,23),
  ('10000000-0000-0000-0000-000000000002','Layali Baghdad Restaurant','Restaurant',
   'Award-winning fine dining in the heart of Al-Mansour. Renowned for our mezze spreads, grilled meats, and warm Iraqi hospitality.',
   true,4.5,18),
  ('10000000-0000-0000-0000-000000000003','Erbil Garden Café','Café',
   'Erbil''s favourite specialty coffee destination. We source single-origin beans and pair them with freshly baked pastries in a lush garden setting.',
   false,4.8,12),
  ('10000000-0000-0000-0000-000000000004','Basra Pearl Catering','Catering Company',
   'Full-service catering for weddings, corporate events, and government functions across southern Iraq. Serving 50–5,000 guests since 2005.',
   true,4.3,9),
  ('10000000-0000-0000-0000-000000000005','Sulaymaniyah Event Palace','Event Venue',
   'Kurdistan''s largest event venue with 3 grand halls, a rooftop terrace, and full A/V production. Capacity 2,000 guests.',
   false,4.6,11);

-- ─── 6. BUSINESS LOCATIONS ───────────────────────────────────

INSERT INTO business_locations (id, business_id, branch_name, city, address, branch_phone, lat, lng, arrival_instructions, photos)
VALUES
  ('30000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Main Hotel & Bar','Baghdad','Al-Rasheed Street, Karrada, Baghdad','+9647901100001',33.3406,44.4009,'Enter through the staff entrance on the east side. Ask for the F&B supervisor. Uniform locker room is on B1.',ARRAY['https://picsum.photos/seed/hotel-bar-baghdad/800/500']),
  ('30000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Grand Banquet Hall','Baghdad','Al-Rasheed Street, Karrada, Baghdad (Annex B)','+9647901100002',33.3408,44.4012,'Banquet hall entrance is separate — use the Annex B door on the north side. Elevator to Hall Level 2.',ARRAY['https://picsum.photos/seed/banquet-hall-baghdad/800/500']),
  ('30000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','Al-Mansour Branch','Baghdad','14 Ramadan Street, Al-Mansour, Baghdad','+9647901100003',33.3217,44.3614,'Park in the lot behind the building. Enter via kitchen entrance and check in with the manager on duty.',ARRAY['https://picsum.photos/seed/restaurant-mansour/800/500']),
  ('30000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000003','Ankawa Garden','Erbil','Dream City Complex, Ankawa, Erbil','+9647501100004',36.2163,44.0068,'Main entrance faces the garden. Baristas report directly to the bar counter. Aprons in the back cupboard.',ARRAY['https://picsum.photos/seed/garden-cafe-erbil/800/500']),
  ('30000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000004','Basra HQ Kitchen','Basra','Industrial Zone 3, Port Road, Basra','+9647701100005',30.5085,47.7804,'Large grey warehouse building. Staff entrance on the south gate. Ask guard for F&B wing access.',ARRAY['https://picsum.photos/seed/catering-kitchen-basra/800/500']),
  ('30000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000005','Main Event Hall','Sulaymaniyah','Salim Street, Sulaymaniyah City Centre','+9647701100006',35.5567,45.4354,'Event staff report to Gate 3. Banquet team uses the loading dock entrance. Coordinator''s office is on Floor 1.',ARRAY['https://picsum.photos/seed/event-hall-sulaymaniyah/800/500']);

-- ─── 7. PRO PROFILES ─────────────────────────────────────────

INSERT INTO pro_profiles
  (user_id, bio, skills, average_rating, completed_shifts,
   days_availability, weekly_hours, work_type, shift_preference,
   skills_by_role, onboarding_completed, onboarding_step, worker_status)
VALUES
  ('20000000-0000-0000-0000-000000000001',
   'Experienced bartender with 6 years in 5-star hotels and high-volume bars across Baghdad. WSET Level 2 certified. Known for speed, precision, and creating a great atmosphere.',
   ARRAY['Bartender','Barista','Barback'],4.83,4,
   ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'20–30',ARRAY['Gig work','Part-time work'],ARRAY['Evening'],
   '{"Bartender":["Cocktail preparation","Bar setup & breakdown","Cash handling","Customer service","Drink knowledge","Speed under pressure"],"Barista":["Espresso preparation","Latte art","Coffee grinding & brewing","Customer service"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000002',
   'Professional front-of-house specialist with 4 years in fine dining. Fluent in Arabic and English. Passionate about creating memorable guest experiences.',
   ARRAY['Restaurant Server','Host','Banquet Server'],4.67,3,
   ARRAY['Wednesday','Thursday','Friday','Saturday','Sunday'],'10–20',ARRAY['Gig work'],ARRAY['Evening'],
   '{"Restaurant Server":["Table service","Menu knowledge","Order taking","Guest interaction","Tray carrying"],"Host":["Guest greeting & seating","Reservation management","Phone etiquette"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000003',
   'Passionate line cook trained in classical Arabic and Mediterranean cuisines. Fast, clean, and reliable. 5 years experience in hotels and catering.',
   ARRAY['Line Cook','Prep Cook','Banquet Cook'],4.50,2,
   ARRAY['Monday','Tuesday','Thursday','Friday'],'20–30',ARRAY['Gig work','Part-time work'],ARRAY['Morning','Daytime'],
   '{"Line Cook":["Knife skills","Food safety & hygiene","Station setup & breakdown","Grill operation","Speed under pressure"],"Banquet Cook":["Large-batch cooking","Banquet menu execution","Food safety & hygiene"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000004',
   'Energetic event specialist based in Erbil. Experienced in large-scale banquets, wedding services, and VIP events. Reliable and professional.',
   ARRAY['Event Staff','Banquet Server','Server Assistant'],4.33,2,
   ARRAY['Thursday','Friday','Saturday','Sunday'],'Less than 10',ARRAY['Gig work'],ARRAY['Evening'],
   '{"Event Staff":["Event setup & breakdown","Guest services","Equipment handling","Communication"],"Banquet Server":["Banquet service","Formal table setting","Plated meal service","Tray carrying"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000005',
   'Hard worker with 3 years in commercial kitchen support roles. Punctual, hygienic, and always a team player. Available most days.',
   ARRAY['Dishwasher','General Cleaning','General Laborer'],4.00,1,
   ARRAY['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'30–40',ARRAY['Gig work','Part-time work'],ARRAY['Daytime','Evening'],
   '{"Dishwasher":["Commercial dishwasher operation","Sanitization standards","Kitchen cleaning","Speed under pressure"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000006',
   'Specialty barista and pastry enthusiast. Trained in Erbil and Istanbul. Creates beautiful lattes and consistently high-quality baked goods.',
   ARRAY['Barista','Baker / Pastry Cook','Server Assistant'],4.92,3,
   ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday'],'20–30',ARRAY['Gig work','Part-time work'],ARRAY['Morning','Daytime'],
   '{"Barista":["Espresso preparation","Latte art","Coffee grinding & brewing","POS operation","Customer service"],"Baker / Pastry Cook":["Bread & pastry baking","Cake decoration","Dessert plating","Dough preparation"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000007',
   'Experienced banquet cook and catering specialist. Comfortable with high-volume service and large-batch cooking. Based in Basra, available for regional events.',
   ARRAY['Banquet Cook','Line Cook','Event Staff'],4.25,2,
   ARRAY['Monday','Wednesday','Friday','Saturday'],'20–30',ARRAY['Gig work'],ARRAY['Morning','Daytime'],
   '{"Banquet Cook":["Large-batch cooking","Banquet menu execution","Food safety & hygiene","Speed under pressure"],"Event Staff":["Event setup & breakdown","Team coordination"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000008',
   'Friendly and efficient server with 3 years in Baghdad''s top restaurants. Quick learner, strong memory for orders, always smiling.',
   ARRAY['Restaurant Server','Busser','Food Runner','Host'],4.58,2,
   ARRAY['Tuesday','Wednesday','Thursday','Friday','Saturday'],'10–20',ARRAY['Gig work'],ARRAY['Evening'],
   '{"Restaurant Server":["Table service","Menu knowledge","Order taking","POS system","Guest interaction","Tray carrying"],"Busser":["Table bussing","Table resetting","Speed & efficiency"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000009',
   'Senior event professional with 8 years managing large-scale events in Sulaymaniyah. Expert coordinator and natural team leader. Available for high-profile bookings.',
   ARRAY['Event Coordinator','Event Lead','Banquet Captain','Banquet Server'],4.78,3,
   ARRAY['Wednesday','Thursday','Friday','Saturday','Sunday'],'10–20',ARRAY['Gig work','Part-time work'],ARRAY['Daytime','Evening'],
   '{"Event Coordinator":["Event planning","Vendor coordination","Timeline management","Client relations","Logistics"],"Banquet Captain":["Team leadership","Service coordination","Quality control","Banquet execution"]}'::jsonb,
   true,5,'active'),
  ('20000000-0000-0000-0000-000000000010',
   'Motivated young server eager to grow in the F&B industry. Currently studying hospitality management. Quick learner with a warm personality.',
   ARRAY['Restaurant Server','Busser','Food Runner'],0.00,0,
   ARRAY['Thursday','Friday','Saturday','Sunday'],'Less than 10',ARRAY['Gig work'],ARRAY['Evening'],
   '{"Restaurant Server":["Table service","Guest interaction","Tray carrying"]}'::jsonb,
   true,5,'active');

-- ─── 8. PRO EXPERIENCES ──────────────────────────────────────

INSERT INTO pro_experiences (pro_id, position, business_name, start_date, end_date, is_current)
VALUES
  ('20000000-0000-0000-0000-000000000001','Head Bartender','Babylon Rotana Hotel','2020-01','2023-06',false),
  ('20000000-0000-0000-0000-000000000001','Bartender','Cristal Grand Ishtar Hotel','2018-03','2019-12',false),
  ('20000000-0000-0000-0000-000000000002','Senior Server','Al-Hamra Restaurant','2021-05',NULL,true),
  ('20000000-0000-0000-0000-000000000003','Sous Chef','Sheraton Baghdad Hotel','2019-02','2024-01',false),
  ('20000000-0000-0000-0000-000000000006','Lead Barista','Ninety Plus Coffee Erbil','2022-03',NULL,true),
  ('20000000-0000-0000-0000-000000000009','Event Manager','Kurdistan Events Co.','2017-01','2023-12',false);

-- ─── 9. SHIFTS (50 total) ────────────────────────────────────
-- platform_fee_iqd = duration_hours * workers_needed * 1000
-- Ahmad (P1) completed: S01, S04, S08, S18 → total 640,000 IQD earned

INSERT INTO shifts
  (id, business_id, location_id, job_title, date, start_time, end_time,
   duration_hours, workers_needed, pro_hourly_rate_iqd, shift_type,
   description, what_to_expect, clothing_rules, required_skills,
   cancellation_policy, payment_terms, special_badge, platform_fee_iqd, status)
VALUES

-- ── B1: Al-Rasheed Grand Hotel (S01–S15) ─────────────────────

('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Bartender','2026-04-20','20:00','04:00',8,1,25000,'one-time',
 'Saturday night service at our lobby bar. High-volume cocktail and mocktail service for hotel guests and walk-ins.',
 'Expect 150–200 covers. Fast-paced but professional. Uniform provided on arrival.',
 ARRAY['All black outfit','Black shoes'],
 ARRAY['Cocktail preparation','Bar setup & breakdown','Speed under pressure'],
 '24h','on_completion',NULL,8000,'completed'),

('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Line Cook','2026-04-15','07:00','15:00',8,2,22000,'one-time',
 'Breakfast and lunch prep for the main kitchen. Supporting executive chef on hot station.',
 'Two-cook team on the grill and sauté stations. All ingredients prepped by 9am for service.',
 ARRAY['Chef whites','Non-slip shoes required'],
 ARRAY['Knife skills','Food safety & hygiene','Grill operation'],
 '24h','on_completion',NULL,16000,'completed'),

('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002',
 'Banquet Server','2026-04-10','17:00','23:00',6,4,18000,'one-time',
 'Government ministerial dinner for 200 guests. Full silver service required.',
 'Formal plated dinner, 5 courses. Strict uniform policy. Briefing at 16:30.',
 ARRAY['White shirt','Black trousers','Black shoes'],
 ARRAY['Banquet service','Formal table setting','Plated meal service'],
 '48h','on_completion',NULL,24000,'completed'),

('40000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Bartender','2026-04-05','18:00','02:00',8,1,28000,'one-time',
 'Private members evening at the Sky Lounge. Premium cocktail menu, VIP clientele.',
 'You will serve a curated 12-cocktail menu. All recipes provided in advance. Tips pool shared.',
 ARRAY['All black outfit','Black shoes'],
 ARRAY['Cocktail preparation','Mixologist','Customer service'],
 '24h','on_completion','premium_pay',8000,'completed'),

('40000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Dishwasher','2026-03-28','14:00','20:00',6,2,12000,'one-time',
 'Afternoon kitchen support. Commercial dishwasher and pot-wash station.',
 'High volume post-lunch through dinner prep. Team of 2 on rotation.',
 ARRAY['Non-slip shoes required'],
 ARRAY['Commercial dishwasher operation','Sanitization standards'],
 '24h','on_completion',NULL,12000,'completed'),

('40000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002',
 'Banquet Setup','2026-03-20','10:00','15:00',5,3,14000,'one-time',
 'Setup for a 400-guest wedding banquet. Table layout, linen, centrepieces.',
 'Physical work — lifting tables and chairs. Layout diagram provided. Supervisor on site.',
 ARRAY['Smart casual','Non-slip shoes required'],
 ARRAY['Table & chair setup','Linen management','Physical stamina'],
 '24h','on_completion',NULL,15000,'completed'),

('40000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002',
 'Event Staff','2026-03-15','08:00','16:00',8,5,16000,'one-time',
 'International business conference day 2. Registration, guest assistance, room coordination.',
 'Professional appearance essential. You will be the face of the hotel for 300+ international delegates.',
 ARRAY['Smart casual','Black shoes'],
 ARRAY['Event setup & breakdown','Guest services','Communication'],
 '48h','on_completion',NULL,40000,'completed'),

('40000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Barback','2026-03-10','20:00','00:00',4,1,15000,'one-time',
 'Friday night bar support. Ice runs, restocking, glass washing during service.',
 'Fast-paced bar night. You keep the bartenders supplied — speed and anticipation are key.',
 ARRAY['All black outfit'],
 ARRAY['Bar restocking','Ice management','Glass washing'],
 '24h','on_completion',NULL,4000,'completed'),

('40000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002',
 'Banquet Captain','2026-05-07','12:00','20:00',8,1,35000,'one-time',
 'Lead the service team for a corporate luncheon. 150 guests, 3-course meal.',
 'You will brief the team, coordinate with kitchen, and ensure flawless execution.',
 ARRAY['White shirt','Black trousers','Black shoes'],
 ARRAY['Team leadership','Service coordination','Client communication','Quality control'],
 '48h','on_completion','urgent',8000,'open'),

('40000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Bartender','2026-05-10','18:00','00:00',6,2,25000,'one-time',
 'Weekend bar service at the lobby lounge. Cocktails, mocktails, beverages.',
 'Two bartenders on shift. Busy but fun. Good tip potential from international guests.',
 ARRAY['All black outfit','Black shoes'],
 ARRAY['Cocktail preparation','Bar setup & breakdown','Customer service'],
 '24h','on_completion',NULL,12000,'open'),

('40000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Line Cook','2026-05-12','08:00','16:00',8,2,22000,'one-time',
 'Day shift kitchen support. Breakfast service and lunch prep.',
 'Working under executive chef on hot station. High standards expected.',
 ARRAY['Chef whites','Non-slip shoes required'],
 ARRAY['Knife skills','Food safety & hygiene','Speed under pressure'],
 '24h','on_completion',NULL,16000,'open'),

('40000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Restaurant Server','2026-05-07','17:00','23:00',6,2,18000,'one-time',
 'Dinner service in the main restaurant. Fine dining experience required.',
 'Table service for 80-100 covers. Silver service may be required. English preferred.',
 ARRAY['White shirt','Black trousers','Black shoes'],
 ARRAY['Table service','Menu knowledge','Guest interaction','Tray carrying'],
 '24h','on_completion',NULL,12000,'filled'),

('40000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002',
 'Event Lead','2026-05-15','08:00','18:00',10,1,40000,'one-time',
 'Lead coordinator for a 600-guest charity gala. Full event management on the day.',
 'You will have a team of 15 staff. Experience with large-scale events is essential.',
 ARRAY['Smart casual'],
 ARRAY['Team supervision','Event coordination','Problem solving','Client communication'],
 '72h','on_completion','urgent',10000,'open'),

('40000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002',
 'Banquet Server','2026-04-25','17:00','23:00',6,3,18000,'one-time',
 'Cancelled: Client rescheduled the event.',NULL,
 ARRAY[]::text[],ARRAY[]::text[],
 NULL,NULL,NULL,18000,'cancelled'),

('40000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001',
 'Food Runner','2026-05-20','17:00','22:00',5,3,14000,'one-time',
 'Dinner service food running. Busy Thursday evening, 3 runners needed.',
 'Fast pace, team environment. Kitchen to table — accuracy and speed are key.',
 ARRAY['All black outfit','Non-slip shoes required'],
 ARRAY['Food delivery','Order accuracy','Speed & urgency','Team communication'],
 '24h','on_completion',NULL,15000,'open'),

-- ── B2: Layali Baghdad Restaurant (S16–S27) ──────────────────

('40000000-0000-0000-0000-000000000016','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Restaurant Server','2026-04-22','17:00','23:00',6,2,18000,'one-time',
 'Weekend dinner service. Our busiest night — 200+ covers expected.',
 'Fast-paced but rewarding. Our regulars are loyal and tip well.',
 ARRAY['White shirt','Black trousers','Black shoes'],
 ARRAY['Table service','Menu knowledge','Order taking','Guest interaction'],
 '24h','on_completion',NULL,12000,'completed'),

('40000000-0000-0000-0000-000000000017','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Line Cook','2026-04-18','08:00','16:00',8,1,22000,'one-time',
 'Day shift on the hot section. Mixed grill and mezze preparation.',
 'Busy prep morning. Lunch service peaks at 13:00. Work directly with head chef.',
 ARRAY['Chef whites','Non-slip shoes required'],
 ARRAY['Knife skills','Food safety & hygiene','Grill operation','Recipe adherence'],
 '24h','on_completion',NULL,8000,'completed'),

('40000000-0000-0000-0000-000000000018','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Bartender','2026-04-12','18:00','00:00',6,1,26000,'one-time',
 'Friday night bar shift. Cocktails, araq, and mocktails for our lounge guests.',
 'Creative cocktail menu, knowledgeable guests. Bring your personality.',
 ARRAY['Black shirt','Black trousers','Black shoes'],
 ARRAY['Cocktail preparation','Bar setup & breakdown','Cash handling','Customer service'],
 '24h','on_completion',NULL,6000,'completed'),

('40000000-0000-0000-0000-000000000019','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Barista','2026-04-08','08:00','13:00',5,1,20000,'one-time',
 'Morning café shift. Specialty coffee service and pastry display management.',
 'We take our coffee seriously. Latte art a plus. Quiet morning, quality over speed.',
 ARRAY['Black shirt','Apron provided'],
 ARRAY['Espresso preparation','Latte art','Coffee grinding & brewing','Customer service'],
 '24h','on_completion',NULL,5000,'completed'),

('40000000-0000-0000-0000-000000000020','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Host','2026-04-02','17:00','23:00',6,1,16000,'one-time',
 'Thursday evening hosting. Reservations, walk-ins, and table management.',
 'Front-of-house face of the restaurant. Professional appearance and warm demeanour essential.',
 ARRAY['Smart casual','Black shoes'],
 ARRAY['Guest greeting & seating','Reservation management','Waitlist management','Floor coordination'],
 '24h','on_completion',NULL,6000,'completed'),

('40000000-0000-0000-0000-000000000021','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Restaurant Server','2026-05-06','17:00','23:00',6,3,18000,'one-time',
 'Tuesday evening — Ramadan special menu running. 3 servers needed.',
 'Expect full house. Special menu requires strong product knowledge. Briefing at 16:30.',
 ARRAY['White shirt','Black trousers','Black shoes'],
 ARRAY['Table service','Menu knowledge','Order taking','Guest interaction'],
 '24h','on_completion',NULL,18000,'open'),

('40000000-0000-0000-0000-000000000022','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Line Cook','2026-05-08','08:00','16:00',8,1,22000,'one-time',
 'Thursday kitchen shift. Mixed hot section, grill and sauté.',
 'Steady professional environment. Experienced cook preferred.',
 ARRAY['Chef whites','Non-slip shoes required'],
 ARRAY['Knife skills','Food safety & hygiene','Grill operation'],
 '24h','on_completion',NULL,8000,'open'),

('40000000-0000-0000-0000-000000000023','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Prep Cook','2026-05-12','07:00','13:00',6,1,18000,'one-time',
 'Morning prep shift. Cold prep, salads, and mezze components.',
 'Independent work — follow prep lists provided. Clean, organised, efficient.',
 ARRAY['Chef whites','Non-slip shoes required'],
 ARRAY['Ingredient preparation','Knife skills','Cold prep','Food safety & hygiene'],
 '24h','on_completion','premium_pay',6000,'open'),

('40000000-0000-0000-0000-000000000024','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Busser','2026-05-15','17:00','22:00',5,2,12000,'one-time',
 'Evening bussing shift. Clear and reset tables quickly during busy service.',
 'Team-player role. Work alongside servers to keep the floor moving.',
 ARRAY['All black outfit'],
 ARRAY['Table bussing','Table resetting','Speed & efficiency','Team support'],
 '24h','on_completion',NULL,10000,'open'),

('40000000-0000-0000-0000-000000000025','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Bartender','2026-05-09','18:00','00:00',6,1,26000,'one-time',
 'Friday night bar — already staffed.',NULL,
 ARRAY['Black shirt','Black trousers'],
 ARRAY['Cocktail preparation','Customer service'],
 '24h','on_completion',NULL,6000,'filled'),

('40000000-0000-0000-0000-000000000026','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Baker / Pastry Cook','2026-05-18','06:00','12:00',6,1,24000,'one-time',
 'Early morning pastry shift. Croissants, Arabic sweets, and dessert prep for the day.',
 'Work solo in the pastry corner. Recipes and quantities on the board.',
 ARRAY['Chef whites','Apron provided'],
 ARRAY['Bread & pastry baking','Dessert plating','Dough preparation','Temperature control'],
 '24h','weekly',NULL,6000,'open'),

('40000000-0000-0000-0000-000000000027','10000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000003',
 'Dishwasher','2026-03-25','17:00','23:00',6,1,12000,'one-time',
 'Cancelled: Kitchen closure for maintenance.',NULL,
 ARRAY[]::text[],ARRAY[]::text[],
 NULL,NULL,NULL,6000,'cancelled'),

-- ── B3: Erbil Garden Café (S28–S35) ──────────────────────────

('40000000-0000-0000-0000-000000000028','10000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',
 'Barista','2026-04-20','08:00','14:00',6,2,19000,'one-time',
 'Sunday morning — our busiest brunch shift. 2 baristas on the full espresso bar.',
 'Back-to-back orders. Latte art expected on every drink. Positive energy a must.',
 ARRAY['Black shirt','Apron provided'],
 ARRAY['Espresso preparation','Latte art','Coffee grinding & brewing','POS operation','Customer service'],
 '24h','on_completion',NULL,12000,'completed'),

('40000000-0000-0000-0000-000000000029','10000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',
 'Server Assistant','2026-04-10','09:00','14:00',5,1,14000,'one-time',
 'Café morning service. Assist the main server — food delivery, clearing, side work.',
 'Light duty support role. Great for someone building their F&B experience.',
 ARRAY['Smart casual','Black shoes'],
 ARRAY['Table setting','Food delivery','Guest interaction','Side work'],
 '24h','on_completion',NULL,5000,'completed'),

('40000000-0000-0000-0000-000000000030','10000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',
 'Baker / Pastry Cook','2026-03-28','06:00','11:00',5,1,22000,'one-time',
 'Saturday morning pastry bake. Croissants, kouign-amann, and seasonal tarts.',
 'Dedicated pastry kitchen. Work independently to a prep list. Quality is paramount.',
 ARRAY['Chef whites','Apron provided'],
 ARRAY['Bread & pastry baking','Dough preparation','Temperature control','Recipe scaling'],
 '24h','on_completion',NULL,5000,'completed'),

('40000000-0000-0000-0000-000000000031','10000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',
 'Barista','2026-05-06','08:00','14:00',6,2,19000,'one-time',
 'Tuesday morning — 2 baristas on the bar for our morning rush.',
 'New menu launching this month — full training provided on arrival.',
 ARRAY['Black shirt','Apron provided'],
 ARRAY['Espresso preparation','Latte art','Coffee grinding & brewing','Customer service'],
 '24h','on_completion','new',12000,'open'),

('40000000-0000-0000-0000-000000000032','10000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',
 'Server Assistant','2026-05-10','10:00','15:00',5,1,14000,'one-time',
 'Afternoon café service support. Food delivery, clearing, and guest assistance.',
 'Relaxed afternoon atmosphere. Perfect for someone wanting to gain hospitality experience.',
 ARRAY['Smart casual'],
 ARRAY['Table setting','Food delivery','Guest interaction'],
 '24h','on_completion',NULL,5000,'open'),

('40000000-0000-0000-0000-000000000033','10000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',
 'Host','2026-05-14','12:00','18:00',6,1,16000,'one-time',
 'Afternoon hosting and reservations. Welcoming walk-in and pre-booked guests.',
 'The café gets very busy between 14:00–17:00. Energy and organisation are key.',
 ARRAY['Smart casual','Black shoes'],
 ARRAY['Guest greeting & seating','Reservation management','Phone etiquette'],
 '24h','on_completion',NULL,6000,'open'),

('40000000-0000-0000-0000-000000000034','10000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',
 'Barista','2026-05-08','08:00','13:00',5,1,19000,'one-time',
 'Thursday morning barista — filled.',NULL,
 ARRAY['Black shirt','Apron provided'],
 ARRAY['Espresso preparation','Latte art','Customer service'],
 '24h','on_completion',NULL,5000,'filled'),

('40000000-0000-0000-0000-000000000035','10000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000004',
 'Dishwasher','2026-05-20','14:00','18:00',4,1,11000,'one-time',
 'Afternoon pot wash and general kitchen clean. Light duty.',
 'Compact kitchen — straightforward work. Must be reliable and punctual.',
 ARRAY['Non-slip shoes required'],
 ARRAY['Commercial dishwasher operation','Kitchen cleaning'],
 '24h','on_completion',NULL,4000,'open'),

-- ── B4: Basra Pearl Catering (S36–S43) ───────────────────────

('40000000-0000-0000-0000-000000000036','10000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005',
 'Banquet Cook','2026-04-18','08:00','16:00',8,3,20000,'one-time',
 'Large corporate lunch for 500 guests. Banquet cook team of 3 on hot section.',
 'High-volume production kitchen. Follow banquet menu exactly. Mise en place starts at 7:30.',
 ARRAY['Chef whites','Non-slip shoes required'],
 ARRAY['Large-batch cooking','Banquet menu execution','Food safety & hygiene','Speed under pressure'],
 '48h','on_completion',NULL,24000,'completed'),

('40000000-0000-0000-0000-000000000037','10000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005',
 'Event Staff','2026-04-08','10:00','16:00',6,4,15000,'one-time',
 'Wedding catering setup and service for 300 guests. Mixed setup and service role.',
 'Split between setup (10:00–13:00) and service (13:00–16:00). Uniform provided.',
 ARRAY['Full uniform provided','Black shoes'],
 ARRAY['Event setup & breakdown','Guest services','Equipment handling','Communication'],
 '48h','on_completion',NULL,24000,'completed'),

('40000000-0000-0000-0000-000000000038','10000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005',
 'Banquet Server','2026-05-05','17:00','23:00',6,4,16000,'one-time',
 'URGENT: Government banquet this Friday. 4 servers required. Must be experienced.',
 'Formal plated service for 180 VIP guests. Silver service required. Briefing at 16:00.',
 ARRAY['White shirt','Black trousers','Black shoes'],
 ARRAY['Banquet service','Formal table setting','Plated meal service','Guest interaction'],
 '48h','on_completion','urgent',24000,'open'),

('40000000-0000-0000-0000-000000000039','10000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005',
 'Line Cook','2026-05-08','08:00','16:00',8,2,20000,'one-time',
 'Thursday kitchen — prep for a weekend wedding. 2 cooks on hot section.',
 'Menu consists of traditional Iraqi dishes at scale. Experience with rice and stews preferred.',
 ARRAY['Chef whites','Non-slip shoes required'],
 ARRAY['Knife skills','Food safety & hygiene','Speed under pressure','Recipe adherence'],
 '24h','on_completion',NULL,16000,'open'),

('40000000-0000-0000-0000-000000000040','10000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005',
 'Event Help','2026-05-12','10:00','15:00',5,3,13000,'one-time',
 'Setup assistance for a corporate event — chairs, tables, and décor.',
 'Physical work. Team of 3. Supervisor on site with full instructions.',
 ARRAY['Smart casual','Non-slip shoes required'],
 ARRAY['Physical setup','Guest support','Team coordination','Adaptability'],
 '24h','on_completion',NULL,15000,'open'),

('40000000-0000-0000-0000-000000000041','10000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005',
 'Banquet Setup','2026-05-18','08:00','12:00',4,5,12000,'one-time',
 'Large wedding — banquet hall setup for 600 guests. 5-person setup team.',
 'Heavy physical work. Tables, chairs, linen, centrepieces. Must be fit and reliable.',
 ARRAY['Smart casual','Non-slip shoes required'],
 ARRAY['Table & chair setup','Linen management','Physical stamina','Attention to detail'],
 '24h','on_completion',NULL,20000,'open'),

('40000000-0000-0000-0000-000000000042','10000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005',
 'Food Assembler','2026-05-10','08:00','14:00',6,1,14000,'one-time',
 'Catering pack and assemble — already staffed.',NULL,
 ARRAY['Chef whites','Apron provided'],
 ARRAY['Food preparation','Speed & accuracy','Food safety','Order accuracy'],
 '24h','on_completion',NULL,6000,'filled'),

('40000000-0000-0000-0000-000000000043','10000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000005',
 'General Laborer','2026-05-22','08:00','16:00',8,4,11000,'one-time',
 'General catering support. Equipment transport and site prep for outdoor event.',
 'Outdoor event in the Basra heat. Bring water. Physical stamina required.',
 ARRAY['Smart casual','Non-slip shoes required'],
 ARRAY['Physical stamina','Equipment operation','Safety compliance','Teamwork'],
 '24h','on_completion',NULL,32000,'open'),

-- ── B5: Sulaymaniyah Event Palace (S44–S50) ──────────────────

('40000000-0000-0000-0000-000000000044','10000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000006',
 'Event Coordinator','2026-04-22','08:00','16:00',8,1,40000,'one-time',
 'Day-of coordination for a 500-guest gala. Vendor management and timeline control.',
 'You will manage 20+ staff, 8 vendors, and direct client liaison. Senior experience only.',
 ARRAY['Smart casual'],
 ARRAY['Event planning','Vendor coordination','Timeline management','Client relations','Logistics'],
 '72h','on_completion',NULL,8000,'completed'),

('40000000-0000-0000-0000-000000000045','10000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000006',
 'Banquet Server','2026-04-12','17:00','23:00',6,5,16000,'one-time',
 'Saturday evening wedding reception. 5 servers for a 350-guest dinner.',
 'Traditional Kurdish wedding format. Plated and buffet hybrid service.',
 ARRAY['White shirt','Black trousers','Black shoes'],
 ARRAY['Banquet service','Plated meal service','Tray carrying','Guest interaction'],
 '48h','on_completion',NULL,30000,'completed'),

('40000000-0000-0000-0000-000000000046','10000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000006',
 'Event Staff','2026-05-05','08:00','16:00',8,6,15000,'one-time',
 'Monday corporate conference. 6 event staff needed for registration and guest flow.',
 'Professional appearance. Mixed role — registration, signage, delegate assistance.',
 ARRAY['Smart casual','Black shoes'],
 ARRAY['Event setup & breakdown','Guest services','Equipment handling'],
 '48h','on_completion','premium_pay',48000,'open'),

('40000000-0000-0000-0000-000000000047','10000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000006',
 'Stage','2026-05-09','14:00','20:00',6,3,18000,'one-time',
 'Live music event — stage setup and breakdown. 3 stage crew needed.',
 'Working with the production team. Physical work, lifting equipment. Tech awareness helpful.',
 ARRAY['Smart casual','Non-slip shoes required'],
 ARRAY['Stage setup & breakdown','Equipment handling','Physical stamina','Team coordination'],
 '24h','on_completion',NULL,18000,'open'),

('40000000-0000-0000-0000-000000000048','10000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000006',
 'Bartender','2026-05-14','18:00','00:00',6,2,25000,'one-time',
 'Wednesday evening bar at the rooftop terrace. High-end guests, cocktail service.',
 'Beautiful rooftop venue. Expect 80–120 guests. Premium cocktail menu provided.',
 ARRAY['All black outfit','Black shoes'],
 ARRAY['Cocktail preparation','Bar setup & breakdown','Customer service','Speed under pressure'],
 '24h','on_completion',NULL,12000,'open'),

('40000000-0000-0000-0000-000000000049','10000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000006',
 'Event Lead','2026-05-20','08:00','16:00',8,1,38000,'one-time',
 'Lead a team of 25 for a major political reception. Highest standards required.',
 'VIP security clearance may be required. Brief at 7:30. Smart dress essential.',
 ARRAY['Smart casual'],
 ARRAY['Team supervision','Event coordination','Problem solving','Client communication'],
 '72h','on_completion','top_rated',8000,'open'),

('40000000-0000-0000-0000-000000000050','10000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000006',
 'Banquet Captain','2026-05-08','12:00','20:00',8,1,35000,'one-time',
 'Thursday banquet — captain position filled.',NULL,
 ARRAY['White shirt','Black trousers','Black shoes'],
 ARRAY['Team leadership','Service coordination','Quality control','Banquet execution'],
 '48h','on_completion',NULL,8000,'filled');

-- ─── 10. APPLICATIONS ────────────────────────────────────────

INSERT INTO applications (id, shift_id, pro_id, status, applied_at, confirmed_clothing, confirmed_cancellation_policy)
VALUES
  ('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','accepted',NOW()-INTERVAL '17 days',true,true),
  ('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','accepted',NOW()-INTERVAL '21 days',true,true),
  ('50000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','accepted',NOW()-INTERVAL '25 days',true,true),
  ('50000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000008','accepted',NOW()-INTERVAL '25 days',true,true),
  ('50000000-0000-0000-0000-000000000005','40000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000001','accepted',NOW()-INTERVAL '30 days',true,true),
  ('50000000-0000-0000-0000-000000000006','40000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005','accepted',NOW()-INTERVAL '38 days',false,true),
  ('50000000-0000-0000-0000-000000000007','40000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000003','accepted',NOW()-INTERVAL '46 days',true,true),
  ('50000000-0000-0000-0000-000000000008','40000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000002','accepted',NOW()-INTERVAL '53 days',true,true),
  ('50000000-0000-0000-0000-000000000009','40000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000004','accepted',NOW()-INTERVAL '53 days',true,true),
  ('50000000-0000-0000-0000-000000000010','40000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000001','accepted',NOW()-INTERVAL '57 days',true,true),
  ('50000000-0000-0000-0000-000000000011','40000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000001','pending', NOW()-INTERVAL '1 day', true,true),
  ('50000000-0000-0000-0000-000000000012','40000000-0000-0000-0000-000000000012','20000000-0000-0000-0000-000000000002','accepted',NOW()-INTERVAL '2 days', true,true),
  ('50000000-0000-0000-0000-000000000013','40000000-0000-0000-0000-000000000012','20000000-0000-0000-0000-000000000008','accepted',NOW()-INTERVAL '2 days', true,true),
  ('50000000-0000-0000-0000-000000000014','40000000-0000-0000-0000-000000000016','20000000-0000-0000-0000-000000000002','accepted',NOW()-INTERVAL '14 days',true,true),
  ('50000000-0000-0000-0000-000000000015','40000000-0000-0000-0000-000000000017','20000000-0000-0000-0000-000000000003','accepted',NOW()-INTERVAL '18 days',true,true),
  ('50000000-0000-0000-0000-000000000016','40000000-0000-0000-0000-000000000018','20000000-0000-0000-0000-000000000001','accepted',NOW()-INTERVAL '24 days',true,true),
  ('50000000-0000-0000-0000-000000000017','40000000-0000-0000-0000-000000000019','20000000-0000-0000-0000-000000000006','accepted',NOW()-INTERVAL '28 days',true,true),
  ('50000000-0000-0000-0000-000000000018','40000000-0000-0000-0000-000000000020','20000000-0000-0000-0000-000000000008','accepted',NOW()-INTERVAL '34 days',true,true),
  ('50000000-0000-0000-0000-000000000019','40000000-0000-0000-0000-000000000021','20000000-0000-0000-0000-000000000010','pending', NOW()-INTERVAL '1 day', true,false),
  ('50000000-0000-0000-0000-000000000020','40000000-0000-0000-0000-000000000025','20000000-0000-0000-0000-000000000001','accepted',NOW()-INTERVAL '3 days', true,true),
  ('50000000-0000-0000-0000-000000000021','40000000-0000-0000-0000-000000000028','20000000-0000-0000-0000-000000000006','accepted',NOW()-INTERVAL '15 days',true,true),
  ('50000000-0000-0000-0000-000000000022','40000000-0000-0000-0000-000000000029','20000000-0000-0000-0000-000000000004','accepted',NOW()-INTERVAL '26 days',true,false),
  ('50000000-0000-0000-0000-000000000023','40000000-0000-0000-0000-000000000030','20000000-0000-0000-0000-000000000006','accepted',NOW()-INTERVAL '39 days',true,true),
  ('50000000-0000-0000-0000-000000000024','40000000-0000-0000-0000-000000000034','20000000-0000-0000-0000-000000000006','accepted',NOW()-INTERVAL '2 days', true,true),
  ('50000000-0000-0000-0000-000000000025','40000000-0000-0000-0000-000000000036','20000000-0000-0000-0000-000000000007','accepted',NOW()-INTERVAL '18 days',true,true),
  ('50000000-0000-0000-0000-000000000026','40000000-0000-0000-0000-000000000037','20000000-0000-0000-0000-000000000007','accepted',NOW()-INTERVAL '28 days',true,true),
  ('50000000-0000-0000-0000-000000000027','40000000-0000-0000-0000-000000000037','20000000-0000-0000-0000-000000000009','accepted',NOW()-INTERVAL '28 days',true,true),
  ('50000000-0000-0000-0000-000000000028','40000000-0000-0000-0000-000000000042','20000000-0000-0000-0000-000000000007','accepted',NOW()-INTERVAL '3 days', true,true),
  ('50000000-0000-0000-0000-000000000029','40000000-0000-0000-0000-000000000044','20000000-0000-0000-0000-000000000009','accepted',NOW()-INTERVAL '14 days',true,true),
  ('50000000-0000-0000-0000-000000000030','40000000-0000-0000-0000-000000000045','20000000-0000-0000-0000-000000000004','accepted',NOW()-INTERVAL '24 days',true,true),
  ('50000000-0000-0000-0000-000000000031','40000000-0000-0000-0000-000000000045','20000000-0000-0000-0000-000000000009','accepted',NOW()-INTERVAL '24 days',true,true),
  ('50000000-0000-0000-0000-000000000032','40000000-0000-0000-0000-000000000050','20000000-0000-0000-0000-000000000009','accepted',NOW()-INTERVAL '2 days', true,true),
  ('50000000-0000-0000-0000-000000000033','40000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000009','pending', NOW()-INTERVAL '1 day', true,true),
  ('50000000-0000-0000-0000-000000000034','40000000-0000-0000-0000-000000000046','20000000-0000-0000-0000-000000000004','pending', NOW()-INTERVAL '2 days', true,true),
  ('50000000-0000-0000-0000-000000000035','40000000-0000-0000-0000-000000000038','20000000-0000-0000-0000-000000000007','pending', NOW()-INTERVAL '1 day', true,true),
  ('50000000-0000-0000-0000-000000000036','40000000-0000-0000-0000-000000000013','20000000-0000-0000-0000-000000000009','pending', NOW()-INTERVAL '1 day', true,true),
  ('50000000-0000-0000-0000-000000000037','40000000-0000-0000-0000-000000000023','20000000-0000-0000-0000-000000000002','withdrawn',NOW()-INTERVAL '5 days',false,false)
ON CONFLICT (id) DO NOTHING;

-- ─── 11. RATINGS ─────────────────────────────────────────────

INSERT INTO ratings (shift_id, rater_id, rated_id, stars, comment)
VALUES
  ('40000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',5,'Ahmad is exceptional. Fastest hands at the bar, never missed a beat. Will hire again.'),
  ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',5,'Great venue, professional team, very fair pay. Would always return to Al-Rasheed.'),
  ('40000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',5,'Premium VIP night — Ahmad handled it perfectly. Guests loved him.'),
  ('40000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',5,'Best shift I have done. Excellent organisation and the premium pay was very fair.'),
  ('40000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',5,'Reliable, fast, and professional. Ahmad keeps the bartenders well-stocked.'),
  ('40000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001',4,'Good shift overall. Brief was slightly late but the team was great.'),
  ('40000000-0000-0000-0000-000000000018','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001',4,'Ahmad is skilled and professional. Cocktail execution was excellent throughout.'),
  ('40000000-0000-0000-0000-000000000018','20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002',5,'Layali Baghdad is a great venue — well organised, friendly staff, on-time payment.'),
  ('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003',4,'Solid cook, good knife skills, kept up during lunch rush. Would hire again.'),
  ('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001',5,'Well-run professional kitchen. The executive chef was great to work with.'),
  ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',5,'Fatima is a natural — graceful, attentive, and the guests adored her.'),
  ('40000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008',4,'Rania performed well in a high-pressure banquet. Reliable and professional.'),
  ('40000000-0000-0000-0000-000000000016','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',5,'Fatima handled the Friday rush like a seasoned pro. Our guests complimented her warmth.'),
  ('40000000-0000-0000-0000-000000000016','20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002',4,'Busy but very enjoyable shift. Management communicated clearly and the briefing was thorough.'),
  ('40000000-0000-0000-0000-000000000017','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000003',5,'Omar is an exceptional cook. His grill work was flawless. Definitely coming back.'),
  ('40000000-0000-0000-0000-000000000019','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000006',5,'Noor''s lattes are works of art. Guests kept asking for her by name.'),
  ('40000000-0000-0000-0000-000000000019','20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000002',5,'Wonderful café, supportive team. I already look forward to the next shift here.'),
  ('40000000-0000-0000-0000-000000000020','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000008',4,'Rania held the door position confidently all evening. Good communication with the floor.'),
  ('40000000-0000-0000-0000-000000000028','10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000006',5,'Two of our best baristas. Noor led the bar beautifully — a real asset.'),
  ('40000000-0000-0000-0000-000000000028','20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000003',5,'Erbil Garden is a dream venue for a barista. The equipment is top quality.'),
  ('40000000-0000-0000-0000-000000000030','10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000006',5,'Noor''s pastries sold out by 10am. Incredible skill and such a calm presence.'),
  ('40000000-0000-0000-0000-000000000036','10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000007',4,'Ali handled high-volume cooking confidently. Would work with him again.'),
  ('40000000-0000-0000-0000-000000000036','20000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000004',4,'Well-organised catering operation. Pay was on time and the team was professional.'),
  ('40000000-0000-0000-0000-000000000037','10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000007',4,'Reliable, followed instructions, good physical endurance.'),
  ('40000000-0000-0000-0000-000000000037','10000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000009',5,'Karwan took initiative and led the service section without needing guidance. Superb.'),
  ('40000000-0000-0000-0000-000000000044','10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000009',5,'Karwan is the best coordinator we have worked with. Flawless 500-guest gala execution.'),
  ('40000000-0000-0000-0000-000000000044','20000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000005',5,'Event Palace is a world-class venue. Excited to work more events here.'),
  ('40000000-0000-0000-0000-000000000045','10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000004',4,'Sara was professional and warm with guests throughout the long evening.'),
  ('40000000-0000-0000-0000-000000000045','10000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000009',5,'Karwan anchored the whole banquet team. Guests were delighted.')
ON CONFLICT (shift_id, rater_id) DO NOTHING;

-- ─── 12. SYNC AGGREGATE STATS ────────────────────────────────

UPDATE pro_profiles SET completed_shifts=4, average_rating=4.83 WHERE user_id='20000000-0000-0000-0000-000000000001';
UPDATE pro_profiles SET completed_shifts=3, average_rating=4.67 WHERE user_id='20000000-0000-0000-0000-000000000002';
UPDATE pro_profiles SET completed_shifts=2, average_rating=4.67 WHERE user_id='20000000-0000-0000-0000-000000000003';
UPDATE pro_profiles SET completed_shifts=2, average_rating=4.00 WHERE user_id='20000000-0000-0000-0000-000000000004';
UPDATE pro_profiles SET completed_shifts=1, average_rating=0.00 WHERE user_id='20000000-0000-0000-0000-000000000005';
UPDATE pro_profiles SET completed_shifts=3, average_rating=5.00 WHERE user_id='20000000-0000-0000-0000-000000000006';
UPDATE pro_profiles SET completed_shifts=2, average_rating=4.00 WHERE user_id='20000000-0000-0000-0000-000000000007';
UPDATE pro_profiles SET completed_shifts=2, average_rating=4.00 WHERE user_id='20000000-0000-0000-0000-000000000008';
UPDATE pro_profiles SET completed_shifts=3, average_rating=5.00 WHERE user_id='20000000-0000-0000-0000-000000000009';

UPDATE business_profiles SET average_rating=4.80, total_ratings=10 WHERE user_id='10000000-0000-0000-0000-000000000001';
UPDATE business_profiles SET average_rating=4.67, total_ratings=3  WHERE user_id='10000000-0000-0000-0000-000000000002';
UPDATE business_profiles SET average_rating=5.00, total_ratings=2  WHERE user_id='10000000-0000-0000-0000-000000000003';
UPDATE business_profiles SET average_rating=4.25, total_ratings=2  WHERE user_id='10000000-0000-0000-0000-000000000004';
UPDATE business_profiles SET average_rating=5.00, total_ratings=2  WHERE user_id='10000000-0000-0000-0000-000000000005';

-- ─── 13. NOTIFICATIONS ───────────────────────────────────────

INSERT INTO notifications (user_id, message, is_read)
VALUES
  ('20000000-0000-0000-0000-000000000001','Your application for Bartender on 10 May 2026 has been submitted.',false),
  ('20000000-0000-0000-0000-000000000001','You have been accepted for Bartender at Layali Baghdad Restaurant on 9 May 2026.',true),
  ('20000000-0000-0000-0000-000000000001','Reminder: You have a shift tomorrow — Bartender at Al-Rasheed Grand Hotel.',true),
  ('20000000-0000-0000-0000-000000000001','Your shift on 20 Apr has been marked completed. Leave a rating for Al-Rasheed Grand Hotel.',true),
  ('10000000-0000-0000-0000-000000000001','New applicant for Bartender on 10 May 2026 — Ahmad Al-Hassan.',false),
  ('10000000-0000-0000-0000-000000000001','New applicant for Banquet Captain on 7 May 2026 — Karwan Aziz.',false),
  ('20000000-0000-0000-0000-000000000002','Your application for Restaurant Server on 6 May 2026 has been submitted.',false),
  ('20000000-0000-0000-0000-000000000002','You have been accepted for Restaurant Server at Al-Rasheed Grand Hotel on 7 May 2026.',true),
  ('20000000-0000-0000-0000-000000000010','Your application for Restaurant Server on 6 May 2026 has been submitted.',false),
  ('10000000-0000-0000-0000-000000000002','New applicant for Restaurant Server on 6 May 2026 — Lina Mohammed.',false),
  ('20000000-0000-0000-0000-000000000009','Your application for Banquet Captain on 7 May 2026 has been submitted.',false),
  ('20000000-0000-0000-0000-000000000009','You have been accepted for Banquet Captain at Sulaymaniyah Event Palace on 8 May 2026.',true),
  ('20000000-0000-0000-0000-000000000004','Your application for Event Staff at Sulaymaniyah Event Palace has been submitted.',false),
  ('20000000-0000-0000-0000-000000000007','Your application for Banquet Server on 5 May 2026 has been submitted.',false);

-- ─── 14. SHIFT TEMPLATES ─────────────────────────────────────

INSERT INTO shift_templates (business_id, name, location_id, job_title, workers_needed, pro_hourly_rate_iqd, shift_type, description, what_to_expect, clothing_rules, required_skills, cancellation_policy, payment_terms, special_badge)
VALUES
  ('10000000-0000-0000-0000-000000000001','Weekend Bartender','30000000-0000-0000-0000-000000000001',
   'Bartender',1,25000,'one-time',
   'Weekend bar service at the lobby lounge. Cocktails, mocktails, beverages.',
   'Two bartenders on shift. Busy but fun. Good tip potential from international guests.',
   ARRAY['All black outfit','Black shoes'],ARRAY['Cocktail preparation','Bar setup & breakdown','Customer service'],
   '24h','on_completion',NULL),
  ('10000000-0000-0000-0000-000000000001','Banquet Server Team','30000000-0000-0000-0000-000000000002',
   'Banquet Server',4,18000,'one-time',
   'Banquet hall service. Formal dining for hotel events.',
   'Formal plated dinner service. Strict uniform. Briefing 1 hour before service.',
   ARRAY['White shirt','Black trousers','Black shoes'],ARRAY['Banquet service','Formal table setting','Plated meal service'],
   '48h','on_completion',NULL);

-- ─── VERIFY ──────────────────────────────────────────────────
SELECT 'auth.users'        AS tbl, COUNT(*) FROM auth.users        UNION ALL
SELECT 'users',                    COUNT(*) FROM users              UNION ALL
SELECT 'business_profiles',        COUNT(*) FROM business_profiles  UNION ALL
SELECT 'business_locations',       COUNT(*) FROM business_locations UNION ALL
SELECT 'pro_profiles',             COUNT(*) FROM pro_profiles       UNION ALL
SELECT 'shifts',                   COUNT(*) FROM shifts             UNION ALL
SELECT 'applications',             COUNT(*) FROM applications       UNION ALL
SELECT 'ratings',                  COUNT(*) FROM ratings            UNION ALL
SELECT 'notifications',            COUNT(*) FROM notifications;
