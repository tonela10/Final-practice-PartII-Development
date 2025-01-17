import sqlite3 from 'sqlite3';
import {Database, open} from 'sqlite';
import {Service} from 'typedi';
import {config} from '../config/environment';

import path from "path";
import {DBQuery} from "./models/db-query";
import {DBQueryResult} from "./models/db-query-result";

@Service()
export class DatabaseService {
    private db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

    public async openDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
        if (this.db) {
            return this.db;
        }

        this.db = await open({
            filename: path.join(__dirname, `../data/${config.dbOptions.database}`),
            driver: sqlite3.Database
        });

        await this.db.exec(`PRAGMA foreign_keys = ON;`);

        return this.db;
    }

    public async closeDatabase(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }

    /**
     * Esta función tiene el objetivo de ejecutar una determinada consulta SQL y
     * devolver los resultados de la ejecución.
     */
    public async execQuery(query: DBQuery): Promise<DBQueryResult> {
        const dbClient = await this.openDatabase();
        const {sql, params} = query;

        try {
            const rows: [] = await dbClient.all(sql, params);

            return {rows: rows, rowCount: rows.length};
        } finally {
            await this.closeDatabase();
        }
    }

    public async initializeDatabase(): Promise<void> {
        await this.openDatabase();

        await this.db!.exec(`
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            date_of_birth TEXT NOT NULL,
            address TEXT NOT NULL
        )
    `);

        await this.db!.exec(`
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            speialtyId INTEGER NOT NULL,
            license_number TEXT NOT NULL UNIQUE,
            location TEXT NOT NULL,
        );
    `);

        await this.db!.exec(`
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
`);
        await this.db!.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
        appointmentId INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        doctorId INTEGER NOT NULL,
        appointmentDate TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(patientId) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY(doctorId) REFERENCES doctors(id) ON DELETE CASCADE
    )
`);

        await this.db!.exec(`
    CREATE TABLE IF NOT EXISTS doctor_availability (
       availabilityId INTEGER PRIMARY KEY AUTOINCREMENT,
       doctorId INTEGER NOT NULL,
       startTime TEXT NOT NULL,
       endTime TEXT NOT NULL,
       days TEXT NOT NULL,  -- Store days as a JSON string
       FOREIGN KEY(doctorId) REFERENCES doctors(id) ON DELETE CASCADE
    )
`);

        await this.db!.exec(`
    CREATE TABLE IF NOT EXISTS medical_records  (
        recordId INTEGER PRIMARY KEY AUTOINCREMENT,
        patientId INTEGER NOT NULL,
        doctorId INTEGER NOT NULL,
        diagnosis TEXT ,
        prescriptions TEXT ,
        notes TEXT,
        ongoingTreatments TEXT,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME
    )
`);

         await this.db!.exec(`
    CREATE TABLE IF NOT EXISTS test_results (
        testResultId INTEGER PRIMARY KEY AUTOINCREMENT,
        recordId INTEGER NOT NULL,
        testName TEXT NOT NULL,
        result TEXT NOT NULL,
        date DATETIME NOT NULL,
        FOREIGN KEY (recordId) REFERENCES medical_records(recordId)
    )
`);
        await this.db!.exec(`
    CREATE TABLE IF NOT EXISTS specialties (
        specialtyId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT
    );
`);
        await this.db!.exec(`
        CREATE TABLE IF NOT EXISTS departments (
            departmentId INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
    );
`);
        await this.closeDatabase();
    }
}
