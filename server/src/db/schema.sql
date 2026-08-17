CREATE TABLE tracking_sessions (
    id SERIAL PRIMARY KEY,

    broadcaster_code VARCHAR(8) NOT NULL UNIQUE,
    viewer_code VARCHAR(8) NOT NULL UNIQUE,

    broadcaster_socket_id TEXT,

    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,

    created_at TIMESTAMP DEFAULT NOW()
);
