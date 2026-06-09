--
-- PostgreSQL database dump
--

\restrict TEQew7KeBSXoN6DdhCbUwaRSRacmwUlJxIAAWsfkgQhzeeqoMIBUsldfHJgrQPE

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text,
    email text,
    password text,
    role text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    employee_code character varying(10) NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: worklogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worklogs (
    id integer NOT NULL,
    user_id integer,
    date date,
    location text,
    project text,
    distance double precision,
    status text,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT worklogs_distance_check CHECK ((distance >= (0)::double precision)),
    CONSTRAINT worklogs_status_check CHECK ((status = ANY (ARRAY['Present'::text, 'On Leave'::text, 'Work From Home'::text, 'On Site'::text, 'Travel'::text])))
);


ALTER TABLE public.worklogs OWNER TO postgres;

--
-- Name: worklogs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.worklogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worklogs_id_seq OWNER TO postgres;

--
-- Name: worklogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.worklogs_id_seq OWNED BY public.worklogs.id;


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: worklogs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worklogs ALTER COLUMN id SET DEFAULT nextval('public.worklogs_id_seq'::regclass);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, created_at, employee_code, is_active) FROM stdin;
1	Admin	antaresweighing@gmail.com	$2b$10$uqM5BST6kE3pefpS52YbQe4WJ4la6h971i.uAVZfgnowmHLEDQgQ6	admin	2026-04-28 16:10:35.539855	AW001	t
9	R Jayachandran	\N	$2b$10$eEib6BoRsXyO1HMHdVErGOfmf61ywtIobzsgEGKPyW0g.lsDRS1Z6	employee	2026-05-16 07:56:55.900763	AW002	t
6	Jai	\N	$2b$10$UfQM98rildnJSXahKX5YQOu3W8LX.FKxksMweoY4SEDfIVNCJDiaS	employee	2026-05-15 08:37:04.23699	AW005	f
\.


--
-- Data for Name: worklogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worklogs (id, user_id, date, location, project, distance, status, remarks, created_at, updated_at) FROM stdin;
6	6	2026-05-15	ad	a	234	Present	efsssf	2026-05-15 15:48:20.570619	2026-05-15 18:44:10.428581
8	6	2026-05-16	Thanjavur, Tamil Nadu, India	23	32	Present		2026-05-15 18:44:43.619859	2026-05-15 19:10:51.659298
42	9	2026-05-16	Tirupati, thnjavur	ravi	12	On Site		2026-05-16 07:59:53.488315	2026-05-16 08:10:39.091919
43	9	2026-06-08	Trichy	office	40	Present		2026-06-08 18:01:21.404274	2026-06-08 18:01:21.404274
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: worklogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.worklogs_id_seq', 43, true);


--
-- Name: worklogs unique_user_date; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worklogs
    ADD CONSTRAINT unique_user_date UNIQUE (user_id, date);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_employee_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_code_key UNIQUE (employee_code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: worklogs worklogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worklogs
    ADD CONSTRAINT worklogs_pkey PRIMARY KEY (id);


--
-- Name: worklogs worklogs_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worklogs
    ADD CONSTRAINT worklogs_user_id_date_key UNIQUE (user_id, date);


--
-- Name: worklogs worklogs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worklogs
    ADD CONSTRAINT worklogs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict TEQew7KeBSXoN6DdhCbUwaRSRacmwUlJxIAAWsfkgQhzeeqoMIBUsldfHJgrQPE

