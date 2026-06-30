-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- Create quizzes table
create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  symbol varchar(10) not null,
  name varchar(100) not null,
  captured_at timestamp with time zone default timezone('utc'::text, now()) not null,
  pattern_type varchar(50) not null,
  initial_chart_data jsonb not null,
  tick_stream_data jsonb not null,
  answer_direction varchar(10) not null check (answer_direction in ('UP', 'DOWN', 'STAY')),
  price_change_ratio numeric not null,
  result_chart_data jsonb not null,
  ai_explanation text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_logs table
create table if not exists user_logs (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references quizzes(id) on delete cascade not null,
  is_correct boolean not null,
  selected_answer varchar(10) not null check (selected_answer in ('UP', 'DOWN', 'STAY')),
  answered_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add index for performance
create index if not exists idx_quizzes_symbol on quizzes(symbol);
create index if not exists idx_quizzes_pattern_type on quizzes(pattern_type);
create index if not exists idx_user_logs_quiz_id on user_logs(quiz_id);
