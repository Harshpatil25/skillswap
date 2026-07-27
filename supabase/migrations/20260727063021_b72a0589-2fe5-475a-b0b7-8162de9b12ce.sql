
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('student','mentor','msme','admin');
CREATE TYPE public.workshop_mode AS ENUM ('online','offline','hybrid');
CREATE TYPE public.workshop_status AS ENUM ('pending','approved','rejected','cancelled');
CREATE TYPE public.registration_status AS ENUM ('registered','cancelled','completed');
CREATE TYPE public.application_status AS ENUM ('applied','shortlisted','rejected','hired');

-- ============ UTIL ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'New member',
  email TEXT,
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  role public.app_role NOT NULL DEFAULT 'student',
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  languages TEXT[] NOT NULL DEFAULT ARRAY['English'],
  experience_years INTEGER NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_city ON public.profiles(city);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _role public.app_role;
BEGIN
  _role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student');
  INSERT INTO public.profiles (user_id, full_name, email, role, city)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email, _role, NEW.raw_user_meta_data->>'city')
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ COMPANIES ============
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  description TEXT,
  website TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  team_size TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_companies_owner ON public.companies(owner_profile_id);
GRANT SELECT ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies public read" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Owner manages company" ON public.companies FOR ALL TO authenticated
  USING (owner_profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SKILLS ============
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  popularity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_skills_category ON public.skills(category);
GRANT SELECT ON public.skills TO anon;
GRANT SELECT ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills public read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admins manage skills" ON public.skills FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'beginner',
  is_teaching BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, skill_id, is_teaching)
);
CREATE INDEX idx_user_skills_profile ON public.user_skills(profile_id);
CREATE INDEX idx_user_skills_skill ON public.user_skills(skill_id);
GRANT SELECT ON public.user_skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills TO authenticated;
GRANT ALL ON public.user_skills TO service_role;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User skills public read" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Own skills manage" ON public.user_skills FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id()) WITH CHECK (profile_id = public.current_profile_id());

-- ============ WORKSHOPS ============
CREATE TABLE public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  banner_url TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  mode public.workshop_mode NOT NULL DEFAULT 'offline',
  level TEXT NOT NULL DEFAULT 'beginner',
  language TEXT NOT NULL DEFAULT 'English',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 30,
  seats_taken INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '7 days',
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  city TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  status public.workshop_status NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workshops_status ON public.workshops(status);
CREATE INDEX idx_workshops_host ON public.workshops(host_profile_id);
CREATE INDEX idx_workshops_category ON public.workshops(category);
CREATE INDEX idx_workshops_starts ON public.workshops(starts_at);
GRANT SELECT ON public.workshops TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workshops TO authenticated;
GRANT ALL ON public.workshops TO service_role;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved workshops public read" ON public.workshops FOR SELECT USING (status = 'approved');
CREATE POLICY "Hosts read own workshops" ON public.workshops FOR SELECT TO authenticated
  USING (host_profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Hosts manage own workshops" ON public.workshops FOR ALL TO authenticated
  USING (host_profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (host_profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_workshops_updated BEFORE UPDATE ON public.workshops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workshop_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.registration_status NOT NULL DEFAULT 'registered',
  attended BOOLEAN NOT NULL DEFAULT false,
  progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workshop_id, profile_id)
);
CREATE INDEX idx_regs_profile ON public.workshop_registrations(profile_id);
CREATE INDEX idx_regs_workshop ON public.workshop_registrations(workshop_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workshop_registrations TO authenticated;
GRANT ALL ON public.workshop_registrations TO service_role;
ALTER TABLE public.workshop_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own registrations" ON public.workshop_registrations FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id()) WITH CHECK (profile_id = public.current_profile_id());
CREATE POLICY "Host reads participants" ON public.workshop_registrations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workshops w WHERE w.id = workshop_id AND w.host_profile_id = public.current_profile_id()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Host updates attendance" ON public.workshop_registrations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.workshops w WHERE w.id = workshop_id AND w.host_profile_id = public.current_profile_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.workshops w WHERE w.id = workshop_id AND w.host_profile_id = public.current_profile_id()));

-- ============ REVIEWS ============
CREATE TABLE public.mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_mentor ON public.mentor_reviews(mentor_profile_id);
GRANT SELECT ON public.mentor_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_reviews TO authenticated;
GRANT ALL ON public.mentor_reviews TO service_role;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews public read" ON public.mentor_reviews FOR SELECT USING (true);
CREATE POLICY "Own reviews manage" ON public.mentor_reviews FOR ALL TO authenticated
  USING (reviewer_profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (reviewer_profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'));

-- ============ INTERNSHIPS ============
CREATE TABLE public.internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  mode public.workshop_mode NOT NULL DEFAULT 'offline',
  stipend NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_months INTEGER NOT NULL DEFAULT 3,
  skills TEXT[] NOT NULL DEFAULT '{}',
  openings INTEGER NOT NULL DEFAULT 1,
  deadline DATE,
  is_open BOOLEAN NOT NULL DEFAULT true,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_internships_company ON public.internships(company_id);
GRANT SELECT ON public.internships TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internships TO authenticated;
GRANT ALL ON public.internships TO service_role;
ALTER TABLE public.internships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Internships public read" ON public.internships FOR SELECT USING (true);
CREATE POLICY "Company manages internships" ON public.internships FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_profile_id = public.current_profile_id()) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_id AND c.owner_profile_id = public.current_profile_id()) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_internships_updated BEFORE UPDATE ON public.internships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.internship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internship_id UUID NOT NULL REFERENCES public.internships(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'applied',
  resume_url TEXT,
  cover_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (internship_id, profile_id)
);
CREATE INDEX idx_apps_profile ON public.internship_applications(profile_id);
CREATE INDEX idx_apps_internship ON public.internship_applications(internship_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internship_applications TO authenticated;
GRANT ALL ON public.internship_applications TO service_role;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own applications" ON public.internship_applications FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id()) WITH CHECK (profile_id = public.current_profile_id());
CREATE POLICY "Company reads applicants" ON public.internship_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.internships i JOIN public.companies c ON c.id = i.company_id WHERE i.id = internship_id AND c.owner_profile_id = public.current_profile_id()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Company updates applicants" ON public.internship_applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.internships i JOIN public.companies c ON c.id = i.company_id WHERE i.id = internship_id AND c.owner_profile_id = public.current_profile_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.internships i JOIN public.companies c ON c.id = i.company_id WHERE i.id = internship_id AND c.owner_profile_id = public.current_profile_id()));

-- ============ CERTIFICATES / NOTIFICATIONS / FAVORITES / MESSAGES ============
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE DEFAULT upper(substr(md5(random()::text),1,10)),
  certificate_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_certs_profile ON public.certificates(profile_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own certificates" ON public.certificates FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (profile_id = public.current_profile_id() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifs_profile ON public.notifications(profile_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications" ON public.notifications FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id()) WITH CHECK (profile_id = public.current_profile_id());

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, entity_type, entity_id)
);
CREATE INDEX idx_fav_profile ON public.favorites(profile_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own favorites" ON public.favorites FOR ALL TO authenticated
  USING (profile_id = public.current_profile_id()) WITH CHECK (profile_id = public.current_profile_id());

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_msg_recipient ON public.messages(recipient_profile_id);
CREATE INDEX idx_msg_sender ON public.messages(sender_profile_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own conversations" ON public.messages FOR SELECT TO authenticated
  USING (sender_profile_id = public.current_profile_id() OR recipient_profile_id = public.current_profile_id());
CREATE POLICY "Send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_profile_id = public.current_profile_id());
CREATE POLICY "Update own received" ON public.messages FOR UPDATE TO authenticated
  USING (recipient_profile_id = public.current_profile_id()) WITH CHECK (recipient_profile_id = public.current_profile_id());

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============ SEED DATA ============
INSERT INTO public.skills (name, slug, category, description, popularity) VALUES
 ('React Development','react','Technology','Build modern web interfaces with React',980),
 ('Python Programming','python','Technology','From basics to data automation',940),
 ('Data Analytics','data-analytics','Technology','Excel, SQL and dashboards',870),
 ('UI/UX Design','ui-ux-design','Design','Design thinking, Figma and prototyping',820),
 ('Graphic Design','graphic-design','Design','Branding, posters and social creatives',640),
 ('Digital Marketing','digital-marketing','Business','SEO, ads and content strategy',910),
 ('Financial Literacy','financial-literacy','Business','Budgeting, investing and taxes',560),
 ('Public Speaking','public-speaking','Soft Skills','Confidence on stage and in interviews',720),
 ('Spoken English','spoken-english','Languages','Fluency for interviews and work',880),
 ('Resume Building','resume-building','Career','Stand out to recruiters',610),
 ('Photography','photography','Creative','Composition, lighting and editing',480),
 ('Video Editing','video-editing','Creative','Premiere, CapCut and storytelling',700),
 ('Tailoring & Fashion','tailoring','Craft','Stitching, patterns and finishing',300),
 ('Baking & Pastry','baking','Craft','Artisan breads and desserts',360),
 ('Carpentry Basics','carpentry','Craft','Tools, joints and small furniture',240),
 ('Machine Learning','machine-learning','Technology','Practical ML with scikit-learn',760),
 ('Mobile App Development','mobile-apps','Technology','Cross-platform apps',680),
 ('E-commerce Selling','ecommerce','Business','Sell online on marketplaces',520),
 ('Content Writing','content-writing','Creative','Blogs, copy and storytelling',590),
 ('Cyber Security Basics','cyber-security','Technology','Stay safe and secure systems',540),
 ('Entrepreneurship','entrepreneurship','Business','Validate and launch your idea',630),
 ('Interview Preparation','interview-prep','Career','Mock interviews and feedback',670),
 ('Excel Mastery','excel','Business','Formulas, pivots and automation',700),
 ('3D Printing','3d-printing','Technology','Design and print prototypes',280);

-- demo mentors
INSERT INTO public.profiles (full_name, email, role, headline, bio, city, latitude, longitude, languages, experience_years, hourly_rate, rating, rating_count, is_demo, avatar_url) VALUES
 ('Ananya Sharma','ananya@demo.skillswap.app','mentor','Senior Frontend Engineer @ Fintech','I teach React and modern frontend architecture through hands-on local workshops.','Bengaluru',12.9716,77.5946,ARRAY['English','Hindi','Kannada'],8,900,4.9,132,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Ananya'),
 ('Rohit Menon','rohit@demo.skillswap.app','mentor','Data Scientist & Mentor','Practical analytics and ML for students who want industry-ready portfolios.','Bengaluru',12.9352,77.6245,ARRAY['English','Malayalam'],10,1200,4.8,98,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Rohit'),
 ('Priya Nair','priya@demo.skillswap.app','mentor','Product Designer','Figma, design systems and portfolio reviews for aspiring designers.','Kochi',9.9312,76.2673,ARRAY['English','Malayalam','Hindi'],6,800,4.9,74,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Priya'),
 ('Vikram Desai','vikram@demo.skillswap.app','mentor','Growth Marketer','Performance marketing for small businesses and creators.','Pune',18.5204,73.8567,ARRAY['English','Marathi','Hindi'],9,750,4.7,64,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Vikram'),
 ('Meera Iyer','meera@demo.skillswap.app','mentor','Communication Coach','Public speaking, spoken English and interview confidence.','Chennai',13.0827,80.2707,ARRAY['English','Tamil'],12,600,5.0,151,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Meera'),
 ('Arjun Kapoor','arjun@demo.skillswap.app','mentor','Full Stack Developer','Python, APIs and deployment. I love weekend build-labs.','Delhi',28.6139,77.2090,ARRAY['English','Hindi'],7,850,4.6,58,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Arjun'),
 ('Fatima Khan','fatima@demo.skillswap.app','mentor','Content & Video Creator','Storytelling, editing and building an audience.','Hyderabad',17.3850,78.4867,ARRAY['English','Urdu','Telugu'],5,500,4.8,42,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Fatima'),
 ('Sanjay Patel','sanjay@demo.skillswap.app','mentor','MSME Finance Advisor','Financial literacy and bookkeeping for young entrepreneurs.','Ahmedabad',23.0225,72.5714,ARRAY['English','Gujarati','Hindi'],15,700,4.7,88,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Sanjay'),
 ('Neha Verma','neha@demo.skillswap.app','mentor','Cyber Security Analyst','Security fundamentals everyone should know.','Bengaluru',12.9081,77.6476,ARRAY['English','Hindi'],6,950,4.5,37,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Neha'),
 ('Karthik Rao','karthik@demo.skillswap.app','mentor','Maker & 3D Printing Expert','Rapid prototyping for student projects.','Mysuru',12.2958,76.6394,ARRAY['English','Kannada'],4,450,4.6,29,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Karthik');

-- demo MSME owners + companies
INSERT INTO public.profiles (full_name, email, role, headline, city, latitude, longitude, is_demo, avatar_url) VALUES
 ('Lakshmi Textiles HR','hr@lakshmitextiles.demo','msme','People Lead at Lakshmi Textiles','Coimbatore',11.0168,76.9558,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Lakshmi'),
 ('BrewBox Cafe Owner','owner@brewbox.demo','msme','Founder at BrewBox','Bengaluru',12.9611,77.6387,true,'https://api.dicebear.com/7.x/notionists/svg?seed=BrewBox'),
 ('PixelForge Studio','studio@pixelforge.demo','msme','Creative Director','Pune',18.5089,73.8553,true,'https://api.dicebear.com/7.x/notionists/svg?seed=Pixel');

INSERT INTO public.companies (owner_profile_id, name, logo_url, industry, description, website, city, latitude, longitude, team_size, verified)
SELECT p.id, v.name, v.logo, v.industry, v.descr, v.site, v.city, v.lat, v.lng, v.size, true
FROM (VALUES
 ('hr@lakshmitextiles.demo','Lakshmi Textiles','https://api.dicebear.com/7.x/initials/svg?seed=LT','Manufacturing','A family-run textile unit training the next generation of makers.','https://example.com','Coimbatore',11.0168,76.9558,'50-200'),
 ('owner@brewbox.demo','BrewBox Cafe','https://api.dicebear.com/7.x/initials/svg?seed=BB','Food & Beverage','Neighbourhood cafe running baking and barista workshops.','https://example.com','Bengaluru',12.9611,77.6387,'11-50'),
 ('studio@pixelforge.demo','PixelForge Studio','https://api.dicebear.com/7.x/initials/svg?seed=PF','Design Agency','Boutique design studio mentoring student designers.','https://example.com','Pune',18.5089,73.8553,'11-50')
) AS v(email,name,logo,industry,descr,site,city,lat,lng,size)
JOIN public.profiles p ON p.email = v.email;

-- mentor skills
INSERT INTO public.user_skills (profile_id, skill_id, level, is_teaching)
SELECT p.id, s.id, 'expert', true FROM (VALUES
 ('ananya@demo.skillswap.app','react'),('ananya@demo.skillswap.app','mobile-apps'),
 ('rohit@demo.skillswap.app','data-analytics'),('rohit@demo.skillswap.app','machine-learning'),('rohit@demo.skillswap.app','python'),
 ('priya@demo.skillswap.app','ui-ux-design'),('priya@demo.skillswap.app','graphic-design'),
 ('vikram@demo.skillswap.app','digital-marketing'),('vikram@demo.skillswap.app','ecommerce'),
 ('meera@demo.skillswap.app','public-speaking'),('meera@demo.skillswap.app','spoken-english'),('meera@demo.skillswap.app','interview-prep'),
 ('arjun@demo.skillswap.app','python'),('arjun@demo.skillswap.app','react'),
 ('fatima@demo.skillswap.app','video-editing'),('fatima@demo.skillswap.app','content-writing'),
 ('sanjay@demo.skillswap.app','financial-literacy'),('sanjay@demo.skillswap.app','entrepreneurship'),('sanjay@demo.skillswap.app','excel'),
 ('neha@demo.skillswap.app','cyber-security'),
 ('karthik@demo.skillswap.app','3d-printing')
) AS v(email,slug)
JOIN public.profiles p ON p.email = v.email
JOIN public.skills s ON s.slug = v.slug;

-- workshops
INSERT INTO public.workshops (host_profile_id, skill_id, title, slug, description, banner_url, category, mode, level, language, price, capacity, seats_taken, starts_at, duration_minutes, city, address, latitude, longitude, rating, rating_count, views, status)
SELECT p.id, s.id, v.title, v.slug, v.descr, v.banner, sk.category, v.mode::public.workshop_mode, v.level, v.lang, v.price, v.cap, v.taken,
       now() + (v.days || ' days')::interval, v.mins, p.city, v.addr, p.latitude, p.longitude, v.rating, v.rcount, v.views, 'approved'
FROM (VALUES
 ('ananya@demo.skillswap.app','react','React in a Weekend: Build & Ship','react-weekend-build-ship','Two intensive days building a production React app: components, state, data fetching and deployment.','https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80','hybrid','beginner','English',799,30,22,6,240,'Indiranagar Learning Hub',4.9,64,1820),
 ('rohit@demo.skillswap.app','data-analytics','Data Analytics Bootcamp with Real Datasets','data-analytics-bootcamp','Clean, analyse and visualise real city datasets. Walk out with a portfolio dashboard.','https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80','offline','intermediate','English',1200,25,19,9,300,'Koramangala Co-Lab',4.8,51,1540),
 ('priya@demo.skillswap.app','ui-ux-design','Figma Masterclass: Design Systems','figma-design-systems','From wireframe to a reusable design system with auto-layout and components.','https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80','online','beginner','English',0,80,63,4,180,'Online (Zoom)',4.9,88,2410),
 ('vikram@demo.skillswap.app','digital-marketing','Performance Marketing for Local Businesses','performance-marketing-local','Run profitable ads for a neighbourhood business — budgets, creatives and measurement.','https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80','offline','intermediate','English',650,40,28,12,210,'Baner Business Center',4.7,33,980),
 ('meera@demo.skillswap.app','public-speaking','Speak With Confidence: Stage Lab','speak-with-confidence','Practice-heavy session with live feedback, recordings and a mini showcase.','https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80','offline','beginner','English',300,20,20,3,150,'T Nagar Community Hall',5.0,110,3120),
 ('arjun@demo.skillswap.app','python','Python Automation for Everyday Work','python-automation','Automate spreadsheets, emails and reports with 100 lines of Python.','https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200&q=80','hybrid','beginner','Hindi',450,50,31,8,180,'Connaught Place Skill Center',4.6,40,1210),
 ('fatima@demo.skillswap.app','video-editing','Short-Form Video Editing Lab','short-form-video-lab','Hooks, pacing and edits that keep viewers watching. Bring your phone.','https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=80','offline','beginner','English',350,35,24,5,150,'Banjara Hills Creator Space',4.8,29,860),
 ('sanjay@demo.skillswap.app','financial-literacy','Money Skills for Young Professionals','money-skills-young-pros','Budgeting, taxes, savings and first investments explained simply.','https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80','online','beginner','Hindi',0,120,94,2,120,'Online (Meet)',4.7,72,2050),
 ('neha@demo.skillswap.app','cyber-security','Cyber Safety Essentials','cyber-safety-essentials','Phishing, passwords, device hygiene and a live hacking demo.','https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80','online','beginner','English',200,60,41,14,120,'Online (Zoom)',4.5,21,640),
 ('karthik@demo.skillswap.app','3d-printing','3D Printing Your First Prototype','3d-printing-first-prototype','Model, slice and print a working prototype in one afternoon.','https://images.unsplash.com/photo-1631541909061-71e349d1f0c1?w=1200&q=80','offline','beginner','Kannada',500,15,11,10,240,'Mysuru Maker Lab',4.6,18,470),
 ('ananya@demo.skillswap.app','mobile-apps','Ship Your First Mobile App','ship-first-mobile-app','Cross-platform app fundamentals with a real device demo.','https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80','hybrid','intermediate','English',999,25,9,18,240,'Indiranagar Learning Hub',4.8,26,720),
 ('meera@demo.skillswap.app','interview-prep','Mock Interview Marathon','mock-interview-marathon','Back-to-back mock interviews with structured feedback.','https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80','offline','intermediate','English',400,18,16,7,240,'T Nagar Community Hall',4.9,57,1330)
) AS v(email,slug_skill,title,slug,descr,banner,mode,level,lang,price,cap,taken,days,mins,addr,rating,rcount,views)
JOIN public.profiles p ON p.email = v.email
JOIN public.skills s ON s.slug = v.slug_skill
JOIN public.skills sk ON sk.slug = v.slug_skill;

-- internships
INSERT INTO public.internships (company_id, title, description, location, mode, stipend, duration_months, skills, openings, deadline, latitude, longitude)
SELECT c.id, v.title, v.descr, c.city, v.mode::public.workshop_mode, v.stipend, v.months, v.skills, v.openings, (current_date + v.dl), c.latitude, c.longitude
FROM (VALUES
 ('Lakshmi Textiles','Production Analytics Intern','Track shop-floor data and build simple dashboards for the production team.','offline',12000,3,ARRAY['Excel Mastery','Data Analytics'],2,30),
 ('Lakshmi Textiles','Textile Design Intern','Assist with pattern making and seasonal collection design.','offline',10000,6,ARRAY['Graphic Design','Tailoring & Fashion'],1,45),
 ('BrewBox Cafe','Social Media Intern','Plan and shoot short-form content for our cafe community.','hybrid',8000,3,ARRAY['Video Editing','Digital Marketing'],2,20),
 ('BrewBox Cafe','Baking Apprentice','Hands-on apprenticeship in our production kitchen.','offline',9000,6,ARRAY['Baking & Pastry'],3,25),
 ('PixelForge Studio','UI/UX Design Intern','Work on real client interfaces with senior designer reviews.','hybrid',15000,6,ARRAY['UI/UX Design','Graphic Design'],2,15),
 ('PixelForge Studio','Frontend Developer Intern','Turn design systems into accessible React components.','online',18000,3,ARRAY['React Development','UI/UX Design'],2,35),
 ('PixelForge Studio','Content Writing Intern','Case studies, newsletters and website copy.','online',7000,3,ARRAY['Content Writing'],1,40)
) AS v(company,title,descr,mode,stipend,months,skills,openings,dl)
JOIN public.companies c ON c.name = v.company;

-- reviews
INSERT INTO public.mentor_reviews (mentor_profile_id, reviewer_profile_id, rating, comment)
SELECT m.id, r.id, v.rating, v.comment
FROM (VALUES
 ('ananya@demo.skillswap.app','rohit@demo.skillswap.app',5,'Incredibly practical session — we deployed a real app by the end of day two.'),
 ('ananya@demo.skillswap.app','priya@demo.skillswap.app',5,'Great pacing and very generous with feedback.'),
 ('rohit@demo.skillswap.app','arjun@demo.skillswap.app',5,'Best analytics workshop I have attended locally.'),
 ('priya@demo.skillswap.app','fatima@demo.skillswap.app',5,'My portfolio finally looks like a designer made it.'),
 ('meera@demo.skillswap.app','neha@demo.skillswap.app',5,'I stopped freezing in interviews after two sessions.'),
 ('vikram@demo.skillswap.app','sanjay@demo.skillswap.app',4,'Actionable ad frameworks for a small budget.'),
 ('fatima@demo.skillswap.app','karthik@demo.skillswap.app',5,'Learned more in 2 hours than in months of tutorials.'),
 ('sanjay@demo.skillswap.app','meera@demo.skillswap.app',5,'Clear, jargon-free and genuinely useful.')
) AS v(mentor,reviewer,rating,comment)
JOIN public.profiles m ON m.email = v.mentor
JOIN public.profiles r ON r.email = v.reviewer;
