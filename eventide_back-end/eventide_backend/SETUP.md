# Eventide Backend Setup

## Local setup

1. Copy `.env.example` to `.env` and fill in the real values.
2. Install dependencies:

```bash
npm install
```

3. Run the API:

```bash
npm run start:dev
```

4. Build for production:

```bash
npm run build
npm run start:prod
```

## Important env vars

- `APP_PORT`: backend HTTP port. Defaults to `3000`.
- `CORS_ORIGIN`: comma-separated allowed frontend origins.
- `TYPEORM_SYNCHRONIZE`: use `true` only for local development.
- `OSRM_URL`: routing service base URL.
- `NOMINATIM_URL`: geocoding service base URL.

## Docker

Development backend:

```bash
docker compose up backend-dev
```

Production backend:

```bash
docker compose up --build backend-prod
```

## Optional: self-hosted routing with OSRM

The backend supports self-hosted open-source routing through `OSRM_URL`.

1. Put an OpenStreetMap extract at:

```text
./data/osrm/map.osm.pbf
```

2. Prepare routing data once:

```bash
docker compose --profile maps-prepare up osrm-prepare
```

3. Start the routing server:

```bash
docker compose --profile maps up -d osrm
```

4. Point the backend to it:

```text
OSRM_URL=http://osrm:5000
```

If you are running the backend outside Docker, use:

```text
OSRM_URL=http://localhost:5000
```
