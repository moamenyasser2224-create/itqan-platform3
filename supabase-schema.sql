-- شغّل الملف ده كامل في Supabase: SQL Editor -> New query -> الصق والصق Run

-- تفعيل uuid
create extension if not exists "uuid-ossp";

-- profiles: ملف تعريفي لكل مستخدم مرتبط بـ auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','teacher','student')),
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

create table teacher_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  subject text,
  bio text,
  subscription_status text default 'trial' check (subscription_status in ('trial','active','expired')),
  subscription_expires_at timestamp with time zone
);

create table classes (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references teacher_profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_image text,
  created_at timestamp with time zone default now()
);

create table lessons (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  type text not null check (type in ('recorded','live')),
  video_url text,
  live_scheduled_at timestamp with time zone,
  live_room_id text,
  duration_minutes int,
  order_index int default 0
);

create table enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  enrolled_at timestamp with time zone default now(),
  status text default 'active' check (status in ('active','expired')),
  unique(student_id, class_id)
);

create table lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default false,
  watched_seconds int default 0,
  last_watched_at timestamp with time zone default now(),
  unique(student_id, lesson_id)
);

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references teacher_profiles(id) on delete cascade,
  amount numeric,
  payment_provider text,
  payment_reference text,
  period_start timestamp with time zone,
  period_end timestamp with time zone,
  status text default 'pending' check (status in ('paid','failed','pending'))
);

-- تفعيل حماية الصفوف (RLS) الأساسية
alter table profiles enable row level security;
alter table teacher_profiles enable row level security;
alter table classes enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table subscriptions enable row level security;

-- سياسات مبدئية: كل مستخدم يشوف بياناته وبيانات صفوفه
create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "teachers manage own profile" on teacher_profiles
  for all using (user_id = auth.uid());

create policy "anyone can read classes" on classes for select using (true);
create policy "teacher manages own classes" on classes
  for insert with check (teacher_id in (select id from teacher_profiles where user_id = auth.uid()));
create policy "teacher updates own classes" on classes
  for update using (teacher_id in (select id from teacher_profiles where user_id = auth.uid()));

create policy "anyone can read lessons" on lessons for select using (true);
create policy "teacher manages own lessons" on lessons
  for insert with check (class_id in (
    select c.id from classes c
    join teacher_profiles t on c.teacher_id = t.id
    where t.user_id = auth.uid()
  ));

create policy "student reads own enrollments" on enrollments
  for select using (student_id = auth.uid());
create policy "student enrolls self" on enrollments
  for insert with check (student_id = auth.uid());

create policy "student manages own progress" on lesson_progress
  for all using (student_id = auth.uid());
