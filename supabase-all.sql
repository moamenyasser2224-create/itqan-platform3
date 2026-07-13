-- ============================================================
-- ملف واحد شامل لمنصة إتقان
-- انسخ الملف ده كامل، الصقه في Supabase SQL Editor، ودوس Run
-- آمن انك تشغله أكتر من مرة من غير ما يحصل خطأ لو جزء منه شغال قبل كده
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============ الجداول ============

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','teacher','student')),
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

create table if not exists teacher_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  subject text,
  bio text,
  subscription_status text default 'trial' check (subscription_status in ('trial','active','expired')),
  subscription_expires_at timestamp with time zone
);

create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references teacher_profiles(id) on delete cascade,
  title text not null,
  description text,
  cover_image text,
  created_at timestamp with time zone default now()
);

create table if not exists lessons (
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

create table if not exists enrollments (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  enrolled_at timestamp with time zone default now(),
  status text default 'active' check (status in ('active','expired')),
  unique(student_id, class_id)
);

create table if not exists lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default false,
  watched_seconds int default 0,
  last_watched_at timestamp with time zone default now(),
  unique(student_id, lesson_id)
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid references teacher_profiles(id) on delete cascade,
  amount numeric,
  payment_provider text,
  payment_reference text,
  period_start timestamp with time zone,
  period_end timestamp with time zone,
  status text default 'pending' check (status in ('paid','failed','pending'))
);

-- ============ تفعيل الحماية على كل جدول ============

alter table profiles enable row level security;
alter table teacher_profiles enable row level security;
alter table classes enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table subscriptions enable row level security;

-- ============ السياسات (كل سياسة بتتمسح وتتعمل من جديد عشان الملف يشتغل من غير أخطاء) ============

drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles for select using (auth.uid() = id);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "insert own profile" on profiles;
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

drop policy if exists "teachers manage own profile" on teacher_profiles;
create policy "teachers manage own profile" on teacher_profiles
  for all using (user_id = auth.uid());

drop policy if exists "anyone can read teacher profiles" on teacher_profiles;
create policy "anyone can read teacher profiles" on teacher_profiles
  for select using (true);

drop policy if exists "anyone can read classes" on classes;
create policy "anyone can read classes" on classes for select using (true);

drop policy if exists "teacher manages own classes" on classes;
create policy "teacher manages own classes" on classes
  for insert with check (teacher_id in (select id from teacher_profiles where user_id = auth.uid()));

drop policy if exists "teacher updates own classes" on classes;
create policy "teacher updates own classes" on classes
  for update using (teacher_id in (select id from teacher_profiles where user_id = auth.uid()));

drop policy if exists "anyone can read lessons" on lessons;
create policy "anyone can read lessons" on lessons for select using (true);

drop policy if exists "teacher manages own lessons" on lessons;
create policy "teacher manages own lessons" on lessons
  for insert with check (class_id in (
    select c.id from classes c
    join teacher_profiles t on c.teacher_id = t.id
    where t.user_id = auth.uid()
  ));

drop policy if exists "student reads own enrollments" on enrollments;
create policy "student reads own enrollments" on enrollments
  for select using (student_id = auth.uid());

drop policy if exists "student enrolls self" on enrollments;
create policy "student enrolls self" on enrollments
  for insert with check (student_id = auth.uid());

drop policy if exists "teacher reads own class enrollments" on enrollments;
create policy "teacher reads own class enrollments" on enrollments
  for select using (
    class_id in (
      select c.id from classes c
      join teacher_profiles t on c.teacher_id = t.id
      where t.user_id = auth.uid()
    )
  );

drop policy if exists "student manages own progress" on lesson_progress;
create policy "student manages own progress" on lesson_progress
  for all using (student_id = auth.uid());

-- ============ حماية إضافية: منع أي حد يغيّر نوع حسابه (معلم/طالب) ============

create or replace function prevent_role_change()
returns trigger as $$
begin
  if old.role <> new.role then
    raise exception 'غير مسموح بتغيير نوع الحساب';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists lock_role_change on profiles;
create trigger lock_role_change
  before update on profiles
  for each row execute function prevent_role_change();

-- ============ صلاحيات تخزين الفيديوهات ============
-- شرط أساسي: لازم تكون عملت bucket اسمه "lesson-videos" من صفحة Storage قبل ما تشغل الجزء ده

drop policy if exists "public can view lesson videos" on storage.objects;
create policy "public can view lesson videos"
  on storage.objects for select
  using (bucket_id = 'lesson-videos');

drop policy if exists "authenticated users can upload lesson videos" on storage.objects;
create policy "authenticated users can upload lesson videos"
  on storage.objects for insert
  with check (bucket_id = 'lesson-videos' and auth.role() = 'authenticated');

drop policy if exists "owner can delete their uploaded videos" on storage.objects;
create policy "owner can delete their uploaded videos"
  on storage.objects for delete
  using (bucket_id = 'lesson-videos' and owner = auth.uid());
