CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
CREATE TYPE role_enum AS ENUM (
    'ADMIN', 
    'STUDENT', 
    'INSTRUCTOR', 
    'DATA_ANALYST'
);

CREATE TYPE program_enum AS ENUM (
    'CERTIFICATE', 
    'DIPLOMA', 
    'DEGREE'
);

CREATE TYPE content_enum AS ENUM (
    'BOOK', 
    'VIDEO', 
    'NOTES'
);

-- Table definitions
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role role_enum NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INT CHECK (age > 0),
    country TEXT,
    skill_level TEXT,
    category TEXT
);

CREATE TABLE instructors (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    experience INT CHECK (experience >= 0),
    rating NUMERIC(3,2) CHECK (rating BETWEEN 0 AND 5)
);

CREATE TABLE partner_university (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL
);

CREATE TABLE textbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,

    UNIQUE (title, author)
);

CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    program_type program_enum NOT NULL,
    duration INT NOT NULL CHECK (duration > 0),
    university_id UUID NOT NULL REFERENCES partner_university(id),
    book_id UUID REFERENCES textbooks(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (name, university_id)
);

CREATE INDEX idx_course_university ON courses(university_id);

CREATE TABLE contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    type content_enum NOT NULL,
    body TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_course ON contents(course_id);


-- Many-to-many relationships

CREATE TABLE course_topics (
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,

    PRIMARY KEY (course_id, topic_id)
);

CREATE INDEX idx_course_topics_topic ON course_topics(topic_id);

CREATE TABLE teaches (
    instructor_id UUID REFERENCES instructors(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,

    PRIMARY KEY (instructor_id, course_id)
);

CREATE INDEX idx_teaches_course ON teaches(course_id);

CREATE TABLE enrollments (
    student_id UUID REFERENCES students(user_id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    marks INT CHECK (marks BETWEEN 0 AND 100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (student_id, course_id)
);

CREATE INDEX idx_enroll_course ON enrollments(course_id);