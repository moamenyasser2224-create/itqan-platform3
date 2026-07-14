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

create table if not exists materials (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  file_url text not null,
  file_type text,
  created_at timestamp with time zone default now()
);

create table if not exists challenges (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  description text,
  period text default 'weekly' check (period in ('daily','weekly')),
  target_lessons int default 1,
  starts_at timestamp with time zone default now(),
  ends_at timestamp with time zone not null
);

create table if not exists questions (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  created_at timestamp with time zone default now()
);

create table if not exists answers (
  id uuid primary key default uuid_generate_v4(),
  question_id uuid references questions(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  body text not null,
  created_at timestamp with time zone default now()
);

create table if not exists quizzes (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  duration_minutes int default 20,
  created_at timestamp with time zone default now()
);

create table if not exists quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quizzes(id) on delete cascade,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a','b','c','d')),
  order_index int default 0
);

create table if not exists quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references quizzes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  score int,
  total int,
  started_at timestamp with time zone default now(),
  submitted_at timestamp with time zone
);

-- ============ تفعيل الحماية على كل جدول ============

alter table profiles enable row level security;
alter table teacher_profiles enable row level security;
alter table classes enable row level security;
alter table lessons enable row level security;
alter table enrollments enable row level security;
alter table lesson_progress enable row level security;
alter table subscriptions enable row level security;
alter table materials enable row level security;
alter table challenges enable row level security;
alter table questions enable row level security;
alter table answers enable row level security;
alter table quizzes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_attempts enable row level security;

-- ============ السياسات (كل سياسة بتتمسح وتتعمل من جديد عشان الملف يشتغل من غير أخطاء) ============

drop policy if exists "read own profile" on profiles;
create policy "read own profile" on profiles for select using (auth.uid() = id);

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "insert own profile" on profiles;
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

drop policy if exists "anyone can read basic profile info" on profiles;
create policy "anyone can read basic profile info" on profiles for select using (true);

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

-- ============ سياسات جدول الملفات والملخصات ============

drop policy if exists "anyone can read materials" on materials;
create policy "anyone can read materials" on materials for select using (true);

drop policy if exists "teacher manages own materials" on materials;
create policy "teacher manages own materials" on materials
  for insert with check (class_id in (
    select c.id from classes c
    join teacher_profiles t on c.teacher_id = t.id
    where t.user_id = auth.uid()
  ));

-- ============ التحديات ============
drop policy if exists "anyone can read challenges" on challenges;
create policy "anyone can read challenges" on challenges for select using (true);

drop policy if exists "teacher creates own challenges" on challenges;
create policy "teacher creates own challenges" on challenges
  for insert with check (class_id in (
    select c.id from classes c
    join teacher_profiles t on c.teacher_id = t.id
    where t.user_id = auth.uid()
  ));

-- ============ المجتمع (أسئلة وأجوبة) ============
drop policy if exists "anyone can read questions" on questions;
create policy "anyone can read questions" on questions for select using (true);

drop policy if exists "logged in users post questions" on questions;
create policy "logged in users post questions" on questions
  for insert with check (author_id = auth.uid());

drop policy if exists "anyone can read answers" on answers;
create policy "anyone can read answers" on answers for select using (true);

drop policy if exists "logged in users post answers" on answers;
create policy "logged in users post answers" on answers
  for insert with check (author_id = auth.uid());

-- ============ الامتحانات ============
drop policy if exists "anyone can read quizzes" on quizzes;
create policy "anyone can read quizzes" on quizzes for select using (true);

drop policy if exists "teacher creates own quizzes" on quizzes;
create policy "teacher creates own quizzes" on quizzes
  for insert with check (class_id in (
    select c.id from classes c
    join teacher_profiles t on c.teacher_id = t.id
    where t.user_id = auth.uid()
  ));

drop policy if exists "students read quiz questions" on quiz_questions;
create policy "students read quiz questions" on quiz_questions for select using (true);

drop policy if exists "teacher adds quiz questions" on quiz_questions;
create policy "teacher adds quiz questions" on quiz_questions
  for insert with check (quiz_id in (
    select q.id from quizzes q
    join classes c on q.class_id = c.id
    join teacher_profiles t on c.teacher_id = t.id
    where t.user_id = auth.uid()
  ));

drop policy if exists "student reads own attempts" on quiz_attempts;
create policy "student reads own attempts" on quiz_attempts
  for select using (student_id = auth.uid());

drop policy if exists "teacher reads class attempts" on quiz_attempts;
create policy "teacher reads class attempts" on quiz_attempts
  for select using (quiz_id in (
    select q.id from quizzes q
    join classes c on q.class_id = c.id
    join teacher_profiles t on c.teacher_id = t.id
    where t.user_id = auth.uid()
  ));

drop policy if exists "student submits own attempt" on quiz_attempts;
create policy "student submits own attempt" on quiz_attempts
  for insert with check (student_id = auth.uid());

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

-- ============ صلاحيات الصور الشخصية ============
-- شرط أساسي: لازم تكون عملت bucket اسمه "avatars" من صفحة Storage (Public) قبل ما تشغل الجزء ده

drop policy if exists "public can view avatars" on storage.objects;
create policy "public can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "authenticated users can upload avatars" on storage.objects;
create policy "authenticated users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

drop policy if exists "owner can update their own avatar" on storage.objects;
create policy "owner can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid());

-- ============ صلاحيات الملفات والملخصات ============
-- شرط أساسي: لازم تكون عملت bucket اسمه "materials" من صفحة Storage (Public) قبل ما تشغل الجزء ده

drop policy if exists "public can view materials" on storage.objects;
create policy "public can view materials"
  on storage.objects for select
  using (bucket_id = 'materials');

drop policy if exists "authenticated users can upload materials" on storage.objects;
create policy "authenticated users can upload materials"
  on storage.objects for insert
  with check (bucket_id = 'materials' and auth.role() = 'authenticated');
