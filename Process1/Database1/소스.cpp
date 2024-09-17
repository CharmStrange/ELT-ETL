#include <iostream>
#include "sqlite3.h"

using namespace std;

sqlite3* f() {
	sqlite3* db;
	sqlite3_open("sqlite.db", &db);
	return db;
}

void executer(sqlite3* db, const char* query) {
	char* E;
	sqlite3_exec(db, query, NULL, NULL, &E);
}

int main() {
	sqlite3* db = f();

	executer(db, "CREATE TABLE TEST \
				T1 TEXT NOT NULL \
				T2 TEXT NOT NULL \
	");
		
	executer(db, " INSERT INTO TEST VALUES('AT1', 'AT2')");
	sqlite3_close(db);
}