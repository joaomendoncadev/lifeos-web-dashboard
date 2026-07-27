CREATE TABLE trips (
  id UUID PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  destination VARCHAR(180) NOT NULL,
  start_date DATE,
  end_date DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'PLANNING',
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  budget NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  cover_emoji VARCHAR(16) NOT NULL DEFAULT '✈️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE trip_itinerary_items (
  id UUID PRIMARY KEY, trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item_date DATE NOT NULL, start_time TIME, title VARCHAR(200) NOT NULL,
  location VARCHAR(220) NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', completed BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE trip_reservations (
  id UUID PRIMARY KEY, trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  reservation_type VARCHAR(40) NOT NULL, provider VARCHAR(160) NOT NULL,
  confirmation_code VARCHAR(100) NOT NULL DEFAULT '', start_at TIMESTAMPTZ, end_at TIMESTAMPTZ,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT ''
);
CREATE TABLE trip_documents (
  id UUID PRIMARY KEY, trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(180) NOT NULL, document_type VARCHAR(50) NOT NULL,
  reference VARCHAR(240) NOT NULL DEFAULT '', expiry_date DATE, ready BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE trip_checklist_items (
  id UUID PRIMARY KEY, trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL, category VARCHAR(80) NOT NULL DEFAULT 'Geral', completed BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE TABLE trip_expenses (
  id UUID PRIMARY KEY, trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  description VARCHAR(200) NOT NULL, category VARCHAR(80) NOT NULL DEFAULT 'Outros',
  amount NUMERIC(14,2) NOT NULL, expense_date DATE NOT NULL, paid BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_trip_itinerary_trip_date ON trip_itinerary_items(trip_id, item_date, start_time);
CREATE INDEX idx_trip_reservations_trip ON trip_reservations(trip_id);
CREATE INDEX idx_trip_documents_trip ON trip_documents(trip_id);
CREATE INDEX idx_trip_checklist_trip ON trip_checklist_items(trip_id);
CREATE INDEX idx_trip_expenses_trip_date ON trip_expenses(trip_id, expense_date);
