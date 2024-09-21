#include <iostream>
#include "sqlite3.h"

using namespace std;

sqlite3* f() {
    sqlite3* db;
    int q = sqlite3_open("sqlite.db", &db);
    if (q) {
        return nullptr;
    }
    return db;
}

void executer(sqlite3* db, const char* query) {
    char* err = 0;
    int q = sqlite3_exec(db, query, NULL, NULL, &err);
    if (q != SQLITE_OK) {
        cout << err << endl;
        sqlite3_free(err);
    }
}
/*
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
*/