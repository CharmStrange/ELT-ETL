#include <iostream>
#include "sqlite3.h"

using namespace std;

sqlite3* f() {
    sqlite3* db;
    int rc = sqlite3_open("sqlite.db", &db);
    if (rc) {
        cout << "Can't open database: " << sqlite3_errmsg(db) << endl;
        return nullptr;
    }
    else {
        cout << "Opened database successfully" << endl;
    }
    return db;
}

void executer(sqlite3* db, const char* query) {
    char* errMsg = 0;
    int rc = sqlite3_exec(db, query, NULL, NULL, &errMsg);
    if (rc != SQLITE_OK) {
        cout << errMsg << endl;
        sqlite3_free(errMsg);
    }
}

int main() {
    sqlite3* db = f();
    if (db == nullptr) return 1; 

    executer(db, "CREATE TABLE IF NOT EXISTS TEST ("
        "T1 TEXT NOT NULL, "
        "T2 TEXT NOT NULL);");

    executer(db, "INSERT INTO TEST VALUES('AT1', 'AT2');");

    sqlite3_close(db);
    return 0;
}
