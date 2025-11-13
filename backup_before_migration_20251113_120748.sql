--
-- PostgreSQL database dump
--

\restrict Qs6h60OxNfUrRUMj1BEUkeSNHsY5rjbw9FIe7GBPWl0s5CXl55Sg6msvf0y0krn

-- Dumped from database version 13.22 (Debian 13.22-1.pgdg13+1)
-- Dumped by pg_dump version 13.22 (Debian 13.22-1.pgdg13+1)

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

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_logins DROP CONSTRAINT IF EXISTS user_logins_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products_menu DROP CONSTRAINT IF EXISTS products_menu_master_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_stock_detail DROP CONSTRAINT IF EXISTS product_stock_detail_supplier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_stock_detail DROP CONSTRAINT IF EXISTS product_stock_detail_stock_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_inventories DROP CONSTRAINT IF EXISTS product_inventories_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_inventories DROP CONSTRAINT IF EXISTS product_inventories_material_id_fkey;
ALTER TABLE IF EXISTS ONLY public.outlets DROP CONSTRAINT IF EXISTS outlets_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.outlet_settings DROP CONSTRAINT IF EXISTS outlet_settings_outlet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.outlet_requests DROP CONSTRAINT IF EXISTS outlet_requests_outlet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.outlet_material_requests DROP CONSTRAINT IF EXISTS outlet_material_requests_outlet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.outlet_material_requests DROP CONSTRAINT IF EXISTS outlet_material_requests_material_id_fkey;
ALTER TABLE IF EXISTS ONLY public.outlet_employees DROP CONSTRAINT IF EXISTS outlet_employees_outlet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.outlet_employees DROP CONSTRAINT IF EXISTS outlet_employees_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_outlet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_item_root_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_suplier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.material_outs DROP CONSTRAINT IF EXISTS material_outs_material_id_fkey;
ALTER TABLE IF EXISTS ONLY public.material_ins DROP CONSTRAINT IF EXISTS material_ins_material_id_fkey;
ALTER TABLE IF EXISTS ONLY public.employee_payrolls DROP CONSTRAINT IF EXISTS employee_payrolls_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS attendances_outlet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS attendances_employee_id_fkey;
ALTER TABLE IF EXISTS ONLY public."MasterProduct" DROP CONSTRAINT IF EXISTS "MasterProduct_category_id_fkey";
DROP INDEX IF EXISTS public.users_username_key;
DROP INDEX IF EXISTS public.supliers_phone_key;
DROP INDEX IF EXISTS public.roles_name_key;
DROP INDEX IF EXISTS public.product_stock_detail_stock_id_key;
DROP INDEX IF EXISTS public.product_categories_name_key;
DROP INDEX IF EXISTS public.outlets_user_id_key;
DROP INDEX IF EXISTS public.outlets_code_key;
DROP INDEX IF EXISTS public.orders_invoice_number_key;
DROP INDEX IF EXISTS public.employees_nik_key;
DROP INDEX IF EXISTS public.attendances_outlet_id_checkin_time_idx;
DROP INDEX IF EXISTS public.attendances_employee_id_checkin_time_idx;
DROP INDEX IF EXISTS public.attendances_checkin_time_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_logins DROP CONSTRAINT IF EXISTS user_logins_pkey;
ALTER TABLE IF EXISTS ONLY public.supliers DROP CONSTRAINT IF EXISTS supliers_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.products_menu DROP CONSTRAINT IF EXISTS products_menu_pkey;
ALTER TABLE IF EXISTS ONLY public.product_stocs DROP CONSTRAINT IF EXISTS product_stocs_pkey;
ALTER TABLE IF EXISTS ONLY public.product_stock_detail DROP CONSTRAINT IF EXISTS product_stock_detail_pkey;
ALTER TABLE IF EXISTS ONLY public.product_inventories DROP CONSTRAINT IF EXISTS product_inventories_pkey;
ALTER TABLE IF EXISTS ONLY public.product_categories DROP CONSTRAINT IF EXISTS product_categories_pkey;
ALTER TABLE IF EXISTS ONLY public.outlets DROP CONSTRAINT IF EXISTS outlets_pkey;
ALTER TABLE IF EXISTS ONLY public.outlet_settings DROP CONSTRAINT IF EXISTS outlet_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.outlet_requests DROP CONSTRAINT IF EXISTS outlet_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.outlet_material_requests DROP CONSTRAINT IF EXISTS outlet_material_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.outlet_employees DROP CONSTRAINT IF EXISTS outlet_employees_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_pkey;
ALTER TABLE IF EXISTS ONLY public.material_outs DROP CONSTRAINT IF EXISTS material_outs_pkey;
ALTER TABLE IF EXISTS ONLY public.material_ins DROP CONSTRAINT IF EXISTS material_ins_pkey;
ALTER TABLE IF EXISTS ONLY public.employees DROP CONSTRAINT IF EXISTS employees_pkey;
ALTER TABLE IF EXISTS ONLY public.employee_payrolls DROP CONSTRAINT IF EXISTS employee_payrolls_pkey;
ALTER TABLE IF EXISTS ONLY public.attendances DROP CONSTRAINT IF EXISTS attendances_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."MasterProduct" DROP CONSTRAINT IF EXISTS "MasterProduct_pkey";
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_logins ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supliers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products_menu ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_stocs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_stock_detail ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_inventories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.outlets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.outlet_settings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.outlet_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.outlet_material_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.outlet_employees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.materials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.material_outs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.material_ins ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.employee_payrolls ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.attendances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."MasterProduct" ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_logins_id_seq;
DROP TABLE IF EXISTS public.user_logins;
DROP SEQUENCE IF EXISTS public.supliers_id_seq;
DROP TABLE IF EXISTS public.supliers;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.products_menu_id_seq;
DROP TABLE IF EXISTS public.products_menu;
DROP SEQUENCE IF EXISTS public.product_stocs_id_seq;
DROP TABLE IF EXISTS public.product_stocs;
DROP SEQUENCE IF EXISTS public.product_stock_detail_id_seq;
DROP TABLE IF EXISTS public.product_stock_detail;
DROP SEQUENCE IF EXISTS public.product_inventories_id_seq;
DROP TABLE IF EXISTS public.product_inventories;
DROP SEQUENCE IF EXISTS public.product_categories_id_seq;
DROP TABLE IF EXISTS public.product_categories;
DROP SEQUENCE IF EXISTS public.outlets_id_seq;
DROP TABLE IF EXISTS public.outlets;
DROP SEQUENCE IF EXISTS public.outlet_settings_id_seq;
DROP TABLE IF EXISTS public.outlet_settings;
DROP SEQUENCE IF EXISTS public.outlet_requests_id_seq;
DROP TABLE IF EXISTS public.outlet_requests;
DROP SEQUENCE IF EXISTS public.outlet_material_requests_id_seq;
DROP TABLE IF EXISTS public.outlet_material_requests;
DROP SEQUENCE IF EXISTS public.outlet_employees_id_seq;
DROP TABLE IF EXISTS public.outlet_employees;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP SEQUENCE IF EXISTS public.materials_id_seq;
DROP TABLE IF EXISTS public.materials;
DROP SEQUENCE IF EXISTS public.material_outs_id_seq;
DROP TABLE IF EXISTS public.material_outs;
DROP SEQUENCE IF EXISTS public.material_ins_id_seq;
DROP TABLE IF EXISTS public.material_ins;
DROP SEQUENCE IF EXISTS public.employees_id_seq;
DROP TABLE IF EXISTS public.employees;
DROP SEQUENCE IF EXISTS public.employee_payrolls_id_seq;
DROP TABLE IF EXISTS public.employee_payrolls;
DROP SEQUENCE IF EXISTS public.attendances_id_seq;
DROP TABLE IF EXISTS public.attendances;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP SEQUENCE IF EXISTS public."MasterProduct_id_seq";
DROP TABLE IF EXISTS public."MasterProduct";
DROP TYPE IF EXISTS public."PRODUCTSOURCE";
DROP TYPE IF EXISTS public."OUTLETREQUESTSTATUS";
DROP TYPE IF EXISTS public."MeritalStatus";
DROP TYPE IF EXISTS public."Gender";
DROP TYPE IF EXISTS public."DAY";
DROP TYPE IF EXISTS public."BLOODTYPE";
DROP TYPE IF EXISTS public."AttendanceStatus";
DROP TYPE IF EXISTS public."ApprovalStatus";
--
-- Name: ApprovalStatus; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."ApprovalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ApprovalStatus" OWNER TO "user";

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'SICK',
    'NOT_PRESENT',
    'EXCUSED',
    'CUTI'
);


ALTER TYPE public."AttendanceStatus" OWNER TO "user";

--
-- Name: BLOODTYPE; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."BLOODTYPE" AS ENUM (
    'A',
    'B',
    'AB',
    'O'
);


ALTER TYPE public."BLOODTYPE" OWNER TO "user";

--
-- Name: DAY; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."DAY" AS ENUM (
    'MONDAY',
    'SUNDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
);


ALTER TYPE public."DAY" OWNER TO "user";

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public."Gender" OWNER TO "user";

--
-- Name: MeritalStatus; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."MeritalStatus" AS ENUM (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED'
);


ALTER TYPE public."MeritalStatus" OWNER TO "user";

--
-- Name: OUTLETREQUESTSTATUS; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."OUTLETREQUESTSTATUS" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'FULFILLED'
);


ALTER TYPE public."OUTLETREQUESTSTATUS" OWNER TO "user";

--
-- Name: PRODUCTSOURCE; Type: TYPE; Schema: public; Owner: user
--

CREATE TYPE public."PRODUCTSOURCE" AS ENUM (
    'PRODUCTION',
    'PURCHASE'
);


ALTER TYPE public."PRODUCTSOURCE" OWNER TO "user";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: MasterProduct; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public."MasterProduct" (
    id integer NOT NULL,
    name text NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public."MasterProduct" OWNER TO "user";

--
-- Name: MasterProduct_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public."MasterProduct_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."MasterProduct_id_seq" OWNER TO "user";

--
-- Name: MasterProduct_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public."MasterProduct_id_seq" OWNED BY public."MasterProduct".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO "user";

--
-- Name: attendances; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.attendances (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    outlet_id integer NOT NULL,
    checkin_image_proof text NOT NULL,
    checkout_image_proof text,
    checkin_time timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    checkout_time timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    late_minutes integer DEFAULT 0 NOT NULL,
    late_notes text,
    late_present_proof text,
    attendance_status public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    late_approval_status public."ApprovalStatus" DEFAULT 'PENDING'::public."ApprovalStatus" NOT NULL,
    notes text
);


ALTER TABLE public.attendances OWNER TO "user";

--
-- Name: attendances_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.attendances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attendances_id_seq OWNER TO "user";

--
-- Name: attendances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.attendances_id_seq OWNED BY public.attendances.id;


--
-- Name: employee_payrolls; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.employee_payrolls (
    id integer NOT NULL,
    employee_id integer NOT NULL,
    salary double precision NOT NULL,
    bonus double precision DEFAULT 0 NOT NULL,
    deductions double precision DEFAULT 0 NOT NULL,
    pay_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employee_payrolls OWNER TO "user";

--
-- Name: employee_payrolls_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.employee_payrolls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employee_payrolls_id_seq OWNER TO "user";

--
-- Name: employee_payrolls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.employee_payrolls_id_seq OWNED BY public.employee_payrolls.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    nik text NOT NULL,
    address text NOT NULL,
    province_id bigint NOT NULL,
    city_id bigint NOT NULL,
    district_id bigint NOT NULL,
    subdistrict_id bigint NOT NULL,
    merital_status public."MeritalStatus" NOT NULL,
    religion text NOT NULL,
    birth_date timestamp(3) without time zone NOT NULL,
    hire_date timestamp(3) without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    birth_place text NOT NULL,
    blood_type public."BLOODTYPE" NOT NULL,
    gender public."Gender" NOT NULL,
    image_path text NOT NULL,
    notes text,
    "position" text NOT NULL,
    rt text NOT NULL,
    rw text NOT NULL,
    work_type text NOT NULL
);


ALTER TABLE public.employees OWNER TO "user";

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_id_seq OWNER TO "user";

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: material_ins; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.material_ins (
    id integer NOT NULL,
    material_id integer NOT NULL,
    price integer NOT NULL,
    quantity_unit text NOT NULL,
    quantity integer NOT NULL,
    received_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.material_ins OWNER TO "user";

--
-- Name: material_ins_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.material_ins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.material_ins_id_seq OWNER TO "user";

--
-- Name: material_ins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.material_ins_id_seq OWNED BY public.material_ins.id;


--
-- Name: material_outs; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.material_outs (
    id integer NOT NULL,
    material_id integer NOT NULL,
    quantity_unit text NOT NULL,
    quantity integer NOT NULL,
    used_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.material_outs OWNER TO "user";

--
-- Name: material_outs_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.material_outs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.material_outs_id_seq OWNER TO "user";

--
-- Name: material_outs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.material_outs_id_seq OWNED BY public.material_outs.id;


--
-- Name: materials; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.materials (
    id integer NOT NULL,
    suplier_id integer NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.materials OWNER TO "user";

--
-- Name: materials_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.materials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.materials_id_seq OWNER TO "user";

--
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.materials_id_seq OWNED BY public.materials.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price double precision NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    order_item_root_id integer
);


ALTER TABLE public.order_items OWNER TO "user";

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.order_items_id_seq OWNER TO "user";

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    outlet_id integer NOT NULL,
    outlet_location text NOT NULL,
    invoice_number text NOT NULL,
    employee_id integer NOT NULL,
    payment_method text NOT NULL,
    total_amount integer NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO "user";

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.orders_id_seq OWNER TO "user";

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: outlet_employees; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.outlet_employees (
    id integer NOT NULL,
    outlet_id integer NOT NULL,
    employee_id integer NOT NULL,
    assigned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.outlet_employees OWNER TO "user";

--
-- Name: outlet_employees_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.outlet_employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.outlet_employees_id_seq OWNER TO "user";

--
-- Name: outlet_employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.outlet_employees_id_seq OWNED BY public.outlet_employees.id;


--
-- Name: outlet_material_requests; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.outlet_material_requests (
    id integer NOT NULL,
    outlet_id integer NOT NULL,
    material_id integer NOT NULL,
    quantity integer NOT NULL,
    approval_quantity integer,
    status public."OUTLETREQUESTSTATUS" DEFAULT 'PENDING'::public."OUTLETREQUESTSTATUS" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.outlet_material_requests OWNER TO "user";

--
-- Name: outlet_material_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.outlet_material_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.outlet_material_requests_id_seq OWNER TO "user";

--
-- Name: outlet_material_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.outlet_material_requests_id_seq OWNED BY public.outlet_material_requests.id;


--
-- Name: outlet_requests; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.outlet_requests (
    id integer NOT NULL,
    outlet_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    approval_quantity integer,
    status text DEFAULT 'PENDING'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.outlet_requests OWNER TO "user";

--
-- Name: outlet_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.outlet_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.outlet_requests_id_seq OWNER TO "user";

--
-- Name: outlet_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.outlet_requests_id_seq OWNED BY public.outlet_requests.id;


--
-- Name: outlet_settings; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.outlet_settings (
    id integer NOT NULL,
    outlet_id integer NOT NULL,
    check_in_time text NOT NULL,
    check_out_time text NOT NULL,
    salary integer NOT NULL,
    day public."DAY"[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.outlet_settings OWNER TO "user";

--
-- Name: outlet_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.outlet_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.outlet_settings_id_seq OWNER TO "user";

--
-- Name: outlet_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.outlet_settings_id_seq OWNED BY public.outlet_settings.id;


--
-- Name: outlets; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.outlets (
    id integer NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    code text NOT NULL,
    description text,
    income_target integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    user_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.outlets OWNER TO "user";

--
-- Name: outlets_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.outlets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.outlets_id_seq OWNER TO "user";

--
-- Name: outlets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.outlets_id_seq OWNED BY public.outlets.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.product_categories (
    id integer NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_categories OWNER TO "user";

--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_categories_id_seq OWNER TO "user";

--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: product_inventories; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.product_inventories (
    id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    material_id integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    quantity_unit text NOT NULL
);


ALTER TABLE public.product_inventories OWNER TO "user";

--
-- Name: product_inventories_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.product_inventories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_inventories_id_seq OWNER TO "user";

--
-- Name: product_inventories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.product_inventories_id_seq OWNED BY public.product_inventories.id;


--
-- Name: product_stock_detail; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.product_stock_detail (
    id integer NOT NULL,
    stock_id integer NOT NULL,
    price double precision NOT NULL,
    supplier_id integer NOT NULL
);


ALTER TABLE public.product_stock_detail OWNER TO "user";

--
-- Name: product_stock_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.product_stock_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_stock_detail_id_seq OWNER TO "user";

--
-- Name: product_stock_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.product_stock_detail_id_seq OWNED BY public.product_stock_detail.id;


--
-- Name: product_stocs; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.product_stocs (
    id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    source_from public."PRODUCTSOURCE" DEFAULT 'PRODUCTION'::public."PRODUCTSOURCE" NOT NULL
);


ALTER TABLE public.product_stocs OWNER TO "user";

--
-- Name: product_stocs_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.product_stocs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_stocs_id_seq OWNER TO "user";

--
-- Name: product_stocs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.product_stocs_id_seq OWNED BY public.product_stocs.id;


--
-- Name: products_menu; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.products_menu (
    id integer NOT NULL,
    image_path text,
    description text,
    price double precision NOT NULL,
    hpp double precision DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    master_product_id integer NOT NULL
);


ALTER TABLE public.products_menu OWNER TO "user";

--
-- Name: products_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.products_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_menu_id_seq OWNER TO "user";

--
-- Name: products_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.products_menu_id_seq OWNED BY public.products_menu.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.roles OWNER TO "user";

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO "user";

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: supliers; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.supliers (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.supliers OWNER TO "user";

--
-- Name: supliers_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.supliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.supliers_id_seq OWNER TO "user";

--
-- Name: supliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.supliers_id_seq OWNED BY public.supliers.id;


--
-- Name: user_logins; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.user_logins (
    id integer NOT NULL,
    user_id integer NOT NULL,
    ip_address text NOT NULL,
    user_agent text NOT NULL,
    login_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_logins OWNER TO "user";

--
-- Name: user_logins_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.user_logins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_logins_id_seq OWNER TO "user";

--
-- Name: user_logins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.user_logins_id_seq OWNED BY public.user_logins.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    name text,
    password text NOT NULL,
    role_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO "user";

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: MasterProduct id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MasterProduct" ALTER COLUMN id SET DEFAULT nextval('public."MasterProduct_id_seq"'::regclass);


--
-- Name: attendances id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.attendances ALTER COLUMN id SET DEFAULT nextval('public.attendances_id_seq'::regclass);


--
-- Name: employee_payrolls id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.employee_payrolls ALTER COLUMN id SET DEFAULT nextval('public.employee_payrolls_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: material_ins id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.material_ins ALTER COLUMN id SET DEFAULT nextval('public.material_ins_id_seq'::regclass);


--
-- Name: material_outs id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.material_outs ALTER COLUMN id SET DEFAULT nextval('public.material_outs_id_seq'::regclass);


--
-- Name: materials id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.materials ALTER COLUMN id SET DEFAULT nextval('public.materials_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: outlet_employees id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_employees ALTER COLUMN id SET DEFAULT nextval('public.outlet_employees_id_seq'::regclass);


--
-- Name: outlet_material_requests id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_material_requests ALTER COLUMN id SET DEFAULT nextval('public.outlet_material_requests_id_seq'::regclass);


--
-- Name: outlet_requests id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_requests ALTER COLUMN id SET DEFAULT nextval('public.outlet_requests_id_seq'::regclass);


--
-- Name: outlet_settings id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_settings ALTER COLUMN id SET DEFAULT nextval('public.outlet_settings_id_seq'::regclass);


--
-- Name: outlets id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlets ALTER COLUMN id SET DEFAULT nextval('public.outlets_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: product_inventories id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_inventories ALTER COLUMN id SET DEFAULT nextval('public.product_inventories_id_seq'::regclass);


--
-- Name: product_stock_detail id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_stock_detail ALTER COLUMN id SET DEFAULT nextval('public.product_stock_detail_id_seq'::regclass);


--
-- Name: product_stocs id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_stocs ALTER COLUMN id SET DEFAULT nextval('public.product_stocs_id_seq'::regclass);


--
-- Name: products_menu id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.products_menu ALTER COLUMN id SET DEFAULT nextval('public.products_menu_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: supliers id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.supliers ALTER COLUMN id SET DEFAULT nextval('public.supliers_id_seq'::regclass);


--
-- Name: user_logins id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_logins ALTER COLUMN id SET DEFAULT nextval('public.user_logins_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: MasterProduct; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public."MasterProduct" (id, name, category_id) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1f090f6a-fbf5-4117-bf36-e6f1bc57b78e	9f5f0fe56b3115cdaf12dee197f14ea5825ef2f49de49c154db806d76ae13710	\N	20251112231625_	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20251112231625_\n\nDatabase error code: 23503\n\nDatabase error:\nERROR: insert or update on table "product_stocs" violates foreign key constraint "product_stocs_product_id_fkey"\nDETAIL: Key (product_id)=(1) is not present in table "products_menu".\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E23503), message: "insert or update on table \\"product_stocs\\" violates foreign key constraint \\"product_stocs_product_id_fkey\\"", detail: Some("Key (product_id)=(1) is not present in table \\"products_menu\\"."), hint: None, position: None, where_: None, schema: Some("public"), table: Some("product_stocs"), column: None, datatype: None, constraint: Some("product_stocs_product_id_fkey"), file: Some("ri_triggers.c"), line: Some(2465), routine: Some("ri_ReportViolation") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20251112231625_"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20251112231625_"\n             at schema-engine/commands/src/commands/apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:244	2025-11-12 23:29:49.502963+00	2025-11-12 23:16:25.193554+00	0
176346ea-1367-42a6-9911-f4e15086b8f4	617692efa50924bc816847583c08a74db444c5e4a493b5a380e6b7533073a6cd	2025-11-06 13:25:56.952555+00	20251106132556_init	\N	\N	2025-11-06 13:25:56.862203+00	1
2cfcd199-b099-4c05-b112-50a4b17e91ab	49d10e5a6f2018e391713c1b47414416bf230689d6ca11a2cdb717b70b51ea6d	2025-11-06 13:26:27.005543+00	20251106132626_add_order_item_root_id	\N	\N	2025-11-06 13:26:27.00107+00	1
ccbd17b2-2734-4b10-9ab7-c9fc3d0aa5fe	08aae9f230322f94d5e2f1309600fa972076db9fcfd5a021f1506c719f52fdf6	2025-11-06 13:28:32.744671+00	20251106132832_	\N	\N	2025-11-06 13:28:32.739153+00	1
59664fcd-edb5-4b66-9229-467a4b41223f	c9c29c1cc503222e8f37be80575ae7e2f8a0e3f10de28db1ba5562dce48c5c97	2025-11-09 15:20:24.88718+00	20251109152024_add_late_information	\N	\N	2025-11-09 15:20:24.879203+00	1
fc0c75d0-de0e-4619-8cd7-b3c890e9940a	1af972c89e00e4312920a602e43e11ec17516ee87cf966876709b4ece76869a8	2025-11-09 15:40:00.839267+00	20251109154000_add_status_attendances	\N	\N	2025-11-09 15:40:00.81646+00	1
971d597a-edf0-4868-b256-27b381199493	57f928a7798bb3498dea304d19d192b46efc23e2bba52f73b668de72fbe9f22a	2025-11-10 08:35:40.634061+00	20251110083402_add_detail_employee	\N	\N	2025-11-10 08:35:40.611632+00	1
8cf3cd81-3047-4286-bd0c-bda1d8800682	1c3fa7e6e789741c5db371a1f493d5a8f82318facbf43eb8105ecc86474993d3	2025-11-10 18:20:29.097232+00	20251110182029_change_outlet_structure	\N	\N	2025-11-10 18:20:29.073329+00	1
876244eb-3e98-4803-a170-87ec05bb1b60	1cc3f36e64e6b0f312897b3945b0af7ebd5d81cccea0a0cfd75c9acd6bb21938	2025-11-10 20:08:03.779102+00	20251110200803_	\N	\N	2025-11-10 20:08:03.768221+00	1
866dbf5a-1332-40db-bd91-dd778ce1fdc8	f2b970fcc06a15534f4475e97ae234e1da7debfc77530c92d914e158c1517e85	2025-11-10 20:50:58.706629+00	20251110205058_	\N	\N	2025-11-10 20:50:58.701194+00	1
edc052ae-5801-499d-a887-8201491ebc93	6720db54dde34def1a4a12f57790a62a334d56d0fc006340005d7cbaeaa53fe5	2025-11-11 11:26:52.371767+00	20251111112652_convert_employee_location_ids_to_bigint	\N	\N	2025-11-11 11:26:52.354328+00	1
e58d07a7-edd4-4184-86f0-a84450ecfe80	293bfaf6efce78d0c303bada18d9fab910b20550aec91c6591ccc4e700b626a6	2025-11-12 17:59:03.696679+00	20251112175903_	\N	\N	2025-11-12 17:59:03.691104+00	1
\.


--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.attendances (id, employee_id, outlet_id, checkin_image_proof, checkout_image_proof, checkin_time, checkout_time, is_active, "createdAt", "updatedAt", late_minutes, late_notes, late_present_proof, attendance_status, late_approval_status, notes) FROM stdin;
3	2	7	compressed-absent-1762849380171-903556816.jpg.webp	\N	2025-11-11 08:23:00.228	\N	t	2025-11-11 08:23:00.229	2025-11-11 08:23:47.043	443	\N	\N	PRESENT	APPROVED	\N
\.


--
-- Data for Name: employee_payrolls; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.employee_payrolls (id, employee_id, salary, bonus, deductions, pay_date, is_active, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.employees (id, name, phone, nik, address, province_id, city_id, district_id, subdistrict_id, merital_status, religion, birth_date, hire_date, is_active, "createdAt", "updatedAt", birth_place, blood_type, gender, image_path, notes, "position", rt, rw, work_type) FROM stdin;
2	Adit	089384292459	3273160308020002	address	11	1101	110101	11010101	SINGLE	islam	2002-10-10 00:00:00	2025-10-10 00:00:00	t	2025-11-10 08:51:34.581	2025-11-10 08:51:34.581	Jakarta	A	MALE	compressed-employee-1762764694461-341129676.jpg.webp	\N	Karyawan	007	004	Pengangguran
\.


--
-- Data for Name: material_ins; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.material_ins (id, material_id, price, quantity_unit, quantity, received_at, "createdAt", "updatedAt") FROM stdin;
1	1	5000	pcs	20	2025-11-10 17:56:59.234	2025-11-10 17:56:59.234	2025-11-10 17:56:59.234
\.


--
-- Data for Name: material_outs; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.material_outs (id, material_id, quantity_unit, quantity, used_at, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.materials (id, suplier_id, name, is_active, "createdAt", "updatedAt") FROM stdin;
1	1	Minyak Goreng Biasa	t	2025-11-10 17:56:59.23	2025-11-10 17:56:59.23
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.order_items (id, order_id, product_id, quantity, price, is_active, "createdAt", "updatedAt", order_item_root_id) FROM stdin;
7	4	1	1	6000	t	2025-11-12 17:59:24.466	2025-11-12 17:59:24.466	\N
8	4	5	5	0	t	2025-11-12 17:59:24.468	2025-11-12 17:59:24.468	7
9	5	1	1	6000	t	2025-11-12 18:16:39.562	2025-11-12 18:16:39.562	\N
10	5	5	5	0	t	2025-11-12 18:16:39.563	2025-11-12 18:16:39.563	9
11	6	1	1	6000	t	2025-11-12 18:16:52.592	2025-11-12 18:16:52.592	\N
12	6	5	5	0	t	2025-11-12 18:16:52.592	2025-11-12 18:16:52.592	11
13	7	1	1	6000	t	2025-11-12 18:17:22.122	2025-11-12 18:17:22.122	\N
14	7	5	5	0	t	2025-11-12 18:17:22.123	2025-11-12 18:17:22.123	13
15	8	1	1	6000	t	2025-11-12 18:40:27.675	2025-11-12 18:40:27.675	\N
16	8	5	5	0	t	2025-11-12 18:40:27.677	2025-11-12 18:40:27.677	15
17	9	1	1	6000	t	2025-11-12 19:09:59.71	2025-11-12 19:09:59.71	\N
18	9	5	5	0	t	2025-11-12 19:09:59.712	2025-11-12 19:09:59.712	17
19	10	1	1	6000	t	2025-11-12 19:12:58.776	2025-11-12 19:12:58.776	\N
20	10	5	5	0	t	2025-11-12 19:12:58.777	2025-11-12 19:12:58.777	19
21	11	1	1	6000	t	2025-11-12 19:27:33.533	2025-11-12 19:27:33.533	\N
22	11	5	5	0	t	2025-11-12 19:27:33.535	2025-11-12 19:27:33.535	21
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.orders (id, outlet_id, outlet_location, invoice_number, employee_id, payment_method, total_amount, status, is_active, "createdAt", "updatedAt") FROM stdin;
4	7	Jl. Menteng Raya No. 123, Jakarta Pusat	TR_MTG5_00001	2	CASH	6000	SUCCESS	t	2025-11-12 17:59:24.458	2025-11-12 17:59:24.458
5	7	Jl. Menteng Raya No. 123, Jakarta Pusat	TR_MTG5_00002	2	CASH	6000	SUCCESS	t	2025-11-12 18:16:39.56	2025-11-12 18:16:39.56
6	7	Jl. Menteng Raya No. 123, Jakarta Pusat	TR_MTG5_00003	2	CASH	6000	SUCCESS	t	2025-11-12 18:16:52.591	2025-11-12 18:16:52.591
7	7	Jl. Menteng Raya No. 123, Jakarta Pusat	TR_MTG5_00004	2	CASH	6000	SUCCESS	t	2025-11-12 18:17:22.12	2025-11-12 18:17:22.12
8	7	Jl. Menteng Raya No. 123, Jakarta Pusat	TR_MTG5_00005	2	CASH	6000	SUCCESS	t	2025-11-12 18:40:27.674	2025-11-12 18:40:27.674
9	7	Jl. Menteng Raya No. 123, Jakarta Pusat	TR_MTG5_00006	2	CASH	6000	SUCCESS	t	2025-11-12 19:09:59.708	2025-11-12 19:09:59.708
10	7	Jl. Menteng Raya No. 123, Jakarta Pusat	TR_MTG5_00007	2	CASH	6000	SUCCESS	t	2025-11-12 19:12:58.774	2025-11-12 19:12:58.774
11	7	Jl. Menteng Raya No. 123, Jakarta Pusat	TR_MTG5_00008	2	CASH	6000	SUCCESS	t	2025-11-12 19:27:33.531	2025-11-12 19:27:33.531
\.


--
-- Data for Name: outlet_employees; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.outlet_employees (id, outlet_id, employee_id, assigned_at, is_active, "createdAt", "updatedAt") FROM stdin;
16	7	2	2025-11-11 00:00:00	t	2025-11-11 08:22:55.232	2025-11-11 08:22:55.232
15	7	2	2025-11-10 00:00:00	f	2025-11-11 08:22:26.851	2025-11-12 17:59:07.879
17	7	2	2025-11-09 17:00:00	t	2025-11-12 17:59:07.88	2025-11-12 17:59:07.88
18	7	2	2025-11-09 17:00:00	t	2025-11-12 17:59:07.884	2025-11-12 17:59:07.884
19	7	2	2025-11-12 17:00:00	t	2025-11-12 17:59:18.79	2025-11-12 17:59:18.79
20	7	2	2025-11-13 17:00:00	t	2025-11-12 17:59:18.796	2025-11-12 17:59:18.796
21	7	2	2025-11-14 17:00:00	t	2025-11-12 17:59:18.802	2025-11-12 17:59:18.802
\.


--
-- Data for Name: outlet_material_requests; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.outlet_material_requests (id, outlet_id, material_id, quantity, approval_quantity, status, is_active, "createdAt", "updatedAt") FROM stdin;
1	7	1	10	\N	PENDING	t	2025-11-12 18:42:54.315	2025-11-12 18:42:54.315
2	7	1	10	\N	PENDING	t	2025-11-12 19:34:14.593	2025-11-12 19:34:14.593
\.


--
-- Data for Name: outlet_requests; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.outlet_requests (id, outlet_id, product_id, quantity, approval_quantity, status, is_active, "createdAt", "updatedAt") FROM stdin;
1	7	1	50	50	APPROVED	t	2025-11-12 18:42:54.303	2025-11-12 18:43:12.733
2	7	3	10	50	APPROVED	t	2025-11-12 18:42:54.303	2025-11-12 18:43:18.591
3	7	1	50	\N	PENDING	t	2025-11-12 19:34:14.588	2025-11-12 19:34:14.588
4	7	3	10	\N	PENDING	t	2025-11-12 19:34:14.588	2025-11-12 19:34:14.588
\.


--
-- Data for Name: outlet_settings; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.outlet_settings (id, outlet_id, check_in_time, check_out_time, salary, day, "createdAt", "updatedAt") FROM stdin;
1	7	08:00:00	16:00:00	150000	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY}	2025-11-10 20:09:15.942	2025-11-10 20:09:15.942
2	7	16:00:00	00:00:00	175000	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY}	2025-11-10 20:09:15.942	2025-11-10 20:09:15.942
3	7	09:00:00	17:00:00	200000	{SATURDAY,SUNDAY}	2025-11-10 20:09:15.942	2025-11-10 20:09:15.942
4	8	08:00:00	16:00:00	150000	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY}	2025-11-10 20:15:01.631	2025-11-10 20:15:01.631
5	8	09:00:00	16:00:00	175000	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY}	2025-11-10 20:15:01.631	2025-11-10 20:15:01.631
6	8	10:00:00	16:00:00	200000	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY}	2025-11-10 20:15:01.631	2025-11-10 20:15:01.631
\.


--
-- Data for Name: outlets; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.outlets (id, name, location, code, description, income_target, is_active, user_id, "createdAt", "updatedAt") FROM stdin;
7	Outlet Menteng	Jl. Menteng Raya No. 123, Jakarta Pusat	MTG5	Outlet cabang Menteng dengan 2 shift kerja	50000000	t	19	2025-11-10 20:09:15.94	2025-11-10 20:09:15.94
8	Outlet Menteng2	Jl. Menteng Raya No. 123, Jakarta Pusat	MTG52	Outlet cabang Menteng dengan 2 shift kerja	50000000	t	20	2025-11-10 20:15:01.63	2025-11-10 20:15:01.63
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.product_categories (id, name, is_active, "createdAt", "updatedAt") FROM stdin;
1	ISI CORNDOG	t	2025-11-06 14:08:54.542	2025-11-06 14:08:54.542
2	BALUTAN	t	2025-11-06 14:08:54.547	2025-11-06 14:08:54.547
3	TOPPING	t	2025-11-06 14:08:54.548	2025-11-06 14:08:54.548
4	SAUS ASIN	t	2025-11-06 14:08:54.55	2025-11-06 14:08:54.55
5	SAUS MANIS	t	2025-11-06 14:08:54.552	2025-11-06 14:08:54.552
\.


--
-- Data for Name: product_inventories; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.product_inventories (id, product_id, quantity, material_id, "createdAt", "updatedAt", quantity_unit) FROM stdin;
\.


--
-- Data for Name: product_stock_detail; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.product_stock_detail (id, stock_id, price, supplier_id) FROM stdin;
\.


--
-- Data for Name: product_stocs; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.product_stocs (id, product_id, quantity, date, source_from) FROM stdin;
1	1	50	2025-11-12 18:42:26.939	PRODUCTION
2	3	50	2025-11-12 18:42:45.678	PRODUCTION
\.


--
-- Data for Name: products_menu; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.products_menu (id, image_path, description, price, hpp, is_active, "createdAt", "updatedAt", master_product_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.roles (id, name, description, "createdAt", "updatedAt", is_active) FROM stdin;
1	Super Admin	SUPER_ADMIN	2025-11-06 14:08:54.436	2025-11-06 14:08:54.436	t
2	Admin	ADMIN	2025-11-06 14:08:54.446	2025-11-06 14:08:54.446	t
3	Manager	MANAGER	2025-11-06 14:08:54.448	2025-11-06 14:08:54.448	t
4	Staff	STAFF	2025-11-06 14:08:54.45	2025-11-06 14:08:54.45	t
5	User	USER	2025-11-06 14:08:54.452	2025-11-06 14:08:54.452	t
6	Outlet	this account is for outlet	2025-11-10 20:51:18.054	2025-11-10 20:51:18.054	t
\.


--
-- Data for Name: supliers; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.supliers (id, name, phone, address, is_active, "createdAt", "updatedAt") FROM stdin;
1	PT.Test	+62895384292458	jl. test	t	2025-11-10 17:56:56.361	2025-11-10 17:56:56.361
\.


--
-- Data for Name: user_logins; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.user_logins (id, user_id, ip_address, user_agent, login_at, is_active, "createdAt", "updatedAt") FROM stdin;
1	1	::1	PostmanRuntime/7.49.0	2025-11-06 14:08:58.678	t	2025-11-06 14:08:58.678	2025-11-06 14:08:58.678
2	1	::1	PostmanRuntime/7.49.0	2025-11-09 15:28:43.697	t	2025-11-09 15:28:43.697	2025-11-09 15:28:43.697
3	1	::1	PostmanRuntime/7.49.0	2025-11-11 08:20:09.381	t	2025-11-11 08:20:09.381	2025-11-11 08:20:09.381
4	19	::1	PostmanRuntime/7.49.0	2025-11-11 08:21:49.077	t	2025-11-11 08:21:49.077	2025-11-11 08:21:49.077
5	19	::1	PostmanRuntime/7.49.0	2025-11-12 17:57:31.32	t	2025-11-12 17:57:31.32	2025-11-12 17:57:31.32
6	19	::1	PostmanRuntime/7.49.0	2025-11-12 18:43:38.82	t	2025-11-12 18:43:38.82	2025-11-12 18:43:38.82
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: user
--

COPY public.users (id, username, name, password, role_id, is_active, "createdAt", "updatedAt") FROM stdin;
1	superadmin	Super Administrator	$2b$10$Jmwe2bDAEszqlEZ6.p/uR.fqrrZ.0wAAgJHidkOJLn1GI0UZAi5Va	1	t	2025-11-06 14:08:54.502	2025-11-06 14:08:54.502
2	admin	Admin User	$2b$10$Jmwe2bDAEszqlEZ6.p/uR.fqrrZ.0wAAgJHidkOJLn1GI0UZAi5Va	2	t	2025-11-06 14:08:54.505	2025-11-06 14:08:54.505
3	manager	Manager User	$2b$10$Jmwe2bDAEszqlEZ6.p/uR.fqrrZ.0wAAgJHidkOJLn1GI0UZAi5Va	3	t	2025-11-06 14:08:54.506	2025-11-06 14:08:54.506
4	staff	Staff User	$2b$10$Jmwe2bDAEszqlEZ6.p/uR.fqrrZ.0wAAgJHidkOJLn1GI0UZAi5Va	4	t	2025-11-06 14:08:54.508	2025-11-06 14:08:54.508
5	john.doe	John Doe	$2b$10$Jmwe2bDAEszqlEZ6.p/uR.fqrrZ.0wAAgJHidkOJLn1GI0UZAi5Va	5	t	2025-11-06 14:08:54.51	2025-11-06 14:08:54.51
6	jane.smith	Jane Smith	$2b$10$Jmwe2bDAEszqlEZ6.p/uR.fqrrZ.0wAAgJHidkOJLn1GI0UZAi5Va	5	t	2025-11-06 14:08:54.511	2025-11-06 14:08:54.511
7	bob.wilson	Bob Wilson	$2b$10$Jmwe2bDAEszqlEZ6.p/uR.fqrrZ.0wAAgJHidkOJLn1GI0UZAi5Va	4	t	2025-11-06 14:08:54.513	2025-11-06 14:08:54.513
8	inactive.user	Inactive User	$2b$10$Jmwe2bDAEszqlEZ6.p/uR.fqrrZ.0wAAgJHidkOJLn1GI0UZAi5Va	5	f	2025-11-06 14:08:54.514	2025-11-06 14:08:54.514
19	menteng5	Manager Menteng	$2b$10$crJwOhfMqt/tPSOpDMuA3eZb9jNZhMtsPlLEYMCywSbFMmmGtGxTe	2	t	2025-11-10 20:09:15.934	2025-11-10 20:09:15.934
20	menteng52	Manager Menteng	$2b$10$FrQ9GiSOAqp2MvAONjENBOFTXqUeDjlasvrVRIYtJdYLxYCA2.nAq	2	t	2025-11-10 20:15:01.625	2025-11-10 20:15:01.625
\.


--
-- Name: MasterProduct_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public."MasterProduct_id_seq"', 1, false);


--
-- Name: attendances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.attendances_id_seq', 3, true);


--
-- Name: employee_payrolls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.employee_payrolls_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.employees_id_seq', 2, true);


--
-- Name: material_ins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.material_ins_id_seq', 1, true);


--
-- Name: material_outs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.material_outs_id_seq', 1, false);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.materials_id_seq', 1, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.order_items_id_seq', 22, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.orders_id_seq', 11, true);


--
-- Name: outlet_employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.outlet_employees_id_seq', 21, true);


--
-- Name: outlet_material_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.outlet_material_requests_id_seq', 2, true);


--
-- Name: outlet_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.outlet_requests_id_seq', 4, true);


--
-- Name: outlet_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.outlet_settings_id_seq', 6, true);


--
-- Name: outlets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.outlets_id_seq', 8, true);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 5, true);


--
-- Name: product_inventories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.product_inventories_id_seq', 1, false);


--
-- Name: product_stock_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.product_stock_detail_id_seq', 1, false);


--
-- Name: product_stocs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.product_stocs_id_seq', 2, true);


--
-- Name: products_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.products_menu_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: supliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.supliers_id_seq', 1, true);


--
-- Name: user_logins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.user_logins_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user
--

SELECT pg_catalog.setval('public.users_id_seq', 20, true);


--
-- Name: MasterProduct MasterProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MasterProduct"
    ADD CONSTRAINT "MasterProduct_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: employee_payrolls employee_payrolls_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.employee_payrolls
    ADD CONSTRAINT employee_payrolls_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: material_ins material_ins_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.material_ins
    ADD CONSTRAINT material_ins_pkey PRIMARY KEY (id);


--
-- Name: material_outs material_outs_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.material_outs
    ADD CONSTRAINT material_outs_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: outlet_employees outlet_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_employees
    ADD CONSTRAINT outlet_employees_pkey PRIMARY KEY (id);


--
-- Name: outlet_material_requests outlet_material_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_material_requests
    ADD CONSTRAINT outlet_material_requests_pkey PRIMARY KEY (id);


--
-- Name: outlet_requests outlet_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_requests
    ADD CONSTRAINT outlet_requests_pkey PRIMARY KEY (id);


--
-- Name: outlet_settings outlet_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_settings
    ADD CONSTRAINT outlet_settings_pkey PRIMARY KEY (id);


--
-- Name: outlets outlets_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_inventories product_inventories_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_inventories
    ADD CONSTRAINT product_inventories_pkey PRIMARY KEY (id);


--
-- Name: product_stock_detail product_stock_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_stock_detail
    ADD CONSTRAINT product_stock_detail_pkey PRIMARY KEY (id);


--
-- Name: product_stocs product_stocs_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_stocs
    ADD CONSTRAINT product_stocs_pkey PRIMARY KEY (id);


--
-- Name: products_menu products_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.products_menu
    ADD CONSTRAINT products_menu_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: supliers supliers_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.supliers
    ADD CONSTRAINT supliers_pkey PRIMARY KEY (id);


--
-- Name: user_logins user_logins_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_logins
    ADD CONSTRAINT user_logins_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: attendances_checkin_time_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX attendances_checkin_time_idx ON public.attendances USING btree (checkin_time);


--
-- Name: attendances_employee_id_checkin_time_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX attendances_employee_id_checkin_time_idx ON public.attendances USING btree (employee_id, checkin_time);


--
-- Name: attendances_outlet_id_checkin_time_idx; Type: INDEX; Schema: public; Owner: user
--

CREATE INDEX attendances_outlet_id_checkin_time_idx ON public.attendances USING btree (outlet_id, checkin_time);


--
-- Name: employees_nik_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX employees_nik_key ON public.employees USING btree (nik);


--
-- Name: orders_invoice_number_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX orders_invoice_number_key ON public.orders USING btree (invoice_number);


--
-- Name: outlets_code_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX outlets_code_key ON public.outlets USING btree (code);


--
-- Name: outlets_user_id_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX outlets_user_id_key ON public.outlets USING btree (user_id);


--
-- Name: product_categories_name_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX product_categories_name_key ON public.product_categories USING btree (name);


--
-- Name: product_stock_detail_stock_id_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX product_stock_detail_stock_id_key ON public.product_stock_detail USING btree (stock_id);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: supliers_phone_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX supliers_phone_key ON public.supliers USING btree (phone);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: user
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: MasterProduct MasterProduct_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public."MasterProduct"
    ADD CONSTRAINT "MasterProduct_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendances attendances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendances attendances_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employee_payrolls employee_payrolls_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.employee_payrolls
    ADD CONSTRAINT employee_payrolls_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: material_ins material_ins_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.material_ins
    ADD CONSTRAINT material_ins_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: material_outs material_outs_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.material_outs
    ADD CONSTRAINT material_outs_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: materials materials_suplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_suplier_id_fkey FOREIGN KEY (suplier_id) REFERENCES public.supliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_order_item_root_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_item_root_id_fkey FOREIGN KEY (order_item_root_id) REFERENCES public.order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: outlet_employees outlet_employees_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_employees
    ADD CONSTRAINT outlet_employees_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: outlet_employees outlet_employees_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_employees
    ADD CONSTRAINT outlet_employees_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: outlet_material_requests outlet_material_requests_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_material_requests
    ADD CONSTRAINT outlet_material_requests_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: outlet_material_requests outlet_material_requests_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_material_requests
    ADD CONSTRAINT outlet_material_requests_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: outlet_requests outlet_requests_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_requests
    ADD CONSTRAINT outlet_requests_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: outlet_settings outlet_settings_outlet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlet_settings
    ADD CONSTRAINT outlet_settings_outlet_id_fkey FOREIGN KEY (outlet_id) REFERENCES public.outlets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: outlets outlets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.outlets
    ADD CONSTRAINT outlets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_inventories product_inventories_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_inventories
    ADD CONSTRAINT product_inventories_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_inventories product_inventories_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_inventories
    ADD CONSTRAINT product_inventories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public."MasterProduct"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_stock_detail product_stock_detail_stock_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_stock_detail
    ADD CONSTRAINT product_stock_detail_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES public.product_stocs(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_stock_detail product_stock_detail_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.product_stock_detail
    ADD CONSTRAINT product_stock_detail_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.supliers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products_menu products_menu_master_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.products_menu
    ADD CONSTRAINT products_menu_master_product_id_fkey FOREIGN KEY (master_product_id) REFERENCES public."MasterProduct"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_logins user_logins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.user_logins
    ADD CONSTRAINT user_logins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict Qs6h60OxNfUrRUMj1BEUkeSNHsY5rjbw9FIe7GBPWl0s5CXl55Sg6msvf0y0krn

