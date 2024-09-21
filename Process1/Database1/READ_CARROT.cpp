#include <iostream>
#include <vector>
#include <string>
#include "sqlite3.h"

#ifdef _WIN32
#include <windows.h>
#endif

using namespace std;

// 데이터를 저장할 구조체 정의
struct Row {
    string Id;
    string AccountInfo;
    string AccountID;
    string AccountPW;
    string Platform;
};

// 데이터베이스 열기 함수
sqlite3* openDatabase(const char* filename) {
    sqlite3* db;
    int rc = sqlite3_open(filename, &db);
    if (rc) {
        cout << "Can't open database: " << sqlite3_errmsg(db) << endl;
        return nullptr;
    }
    return db;
}

// 쿼리 실행 함수 (에러 처리 포함)
void executeQuery(sqlite3* db, const char* query) {
    char* errMsg = 0;
    int rc = sqlite3_exec(db, query, NULL, NULL, &errMsg);
    if (rc != SQLITE_OK) {
        cout << "SQL error: " << errMsg << endl;
        sqlite3_free(errMsg);
    }
}

// 테이블 생성 함수
void createTables(sqlite3* db) {
    const char* createMainTable =
        "CREATE TABLE IF NOT EXISTS Main ("
        "`Id` INTEGER PRIMARY KEY AUTOINCREMENT, "
        "AccountInfo TEXT NOT NULL, "
        "AccountID TEXT NOT NULL, "
        "AccountPW TEXT NOT NULL, "
        "Platform TEXT NOT NULL);";

    const char* createRPGsTable =
        "CREATE TABLE IF NOT EXISTS RPGs ("
        "`Id` INTEGER PRIMARY KEY AUTOINCREMENT, "
        "AccountInfo TEXT NOT NULL, "
        "AccountID TEXT NOT NULL, "
        "AccountPW TEXT NOT NULL, "
        "Platform TEXT NOT NULL);";

    const char* createManagementsTable =
        "CREATE TABLE IF NOT EXISTS Managements ("
        "`Id` INTEGER PRIMARY KEY AUTOINCREMENT, "
        "AccountInfo TEXT NOT NULL, "
        "AccountID TEXT NOT NULL, "
        "AccountPW TEXT NOT NULL, "
        "Platform TEXT NOT NULL);";

    const char* createElseTable =
        "CREATE TABLE IF NOT EXISTS `Else` ("
        "`Id` INTEGER PRIMARY KEY AUTOINCREMENT, "
        "AccountInfo TEXT NOT NULL, "
        "AccountID TEXT NOT NULL, "
        "AccountPW TEXT NOT NULL, "
        "Platform TEXT NOT NULL);";

    executeQuery(db, createMainTable);
    executeQuery(db, createRPGsTable);
    executeQuery(db, createManagementsTable);
    executeQuery(db, createElseTable);
}

// 데이터 삽입 함수
void insertData(sqlite3* db, const char* tableName, const char* accountInfo, const char* accountID, const char* accountPW, const char* platform) {
    string query = "INSERT INTO ";
    query += tableName;
    query += " (AccountInfo, AccountID, AccountPW, Platform) VALUES ('";
    query += accountInfo;
    query += "', '";
    query += accountID;
    query += "', '";
    query += accountPW;
    query += "', '";
    query += platform;
    query += "');";

    executeQuery(db, query.c_str());
}

// 콜백 함수: 각 행을 컨테이너에 저장
static int callback(void* data, int argc, char** argv, char** colName) {
    vector<Row>* rows = static_cast<vector<Row>*>(data);

    Row row;
    row.Id = argv[0] ? argv[0] : "NULL";
    row.AccountInfo = argv[1] ? argv[1] : "NULL";
    row.AccountID = argv[2] ? argv[2] : "NULL";
    row.AccountPW = argv[3] ? argv[3] : "NULL";
    row.Platform = argv[4] ? argv[4] : "NULL";
    rows->push_back(row);

    return 0;
}

// 테이블에서 데이터를 읽어 컨테이너에 저장
void readData(sqlite3* db, const char* tableName, vector<Row>& rows) {
    string query = "SELECT * FROM ";
    query += tableName;
    query += ";";

    char* errMsg = 0;
    int rc = sqlite3_exec(db, query.c_str(), callback, &rows, &errMsg);
    if (rc != SQLITE_OK) {
        cout << "Failed to read data: " << errMsg << endl;
        sqlite3_free(errMsg);
    }
}

// 데이터 삭제 함수
void deleteData(sqlite3* db, const char* tableName, const char* id) {
    string query = "DELETE FROM ";
    query += tableName;
    query += " WHERE Id = ";
    query += id;
    query += ";";

    executeQuery(db, query.c_str());
}

// 데이터 출력 함수
void printData(const vector<Row>& rows) {
    for (const auto& row : rows) {
        cout << "Id: " << row.Id
            << ", Account Info: " << row.AccountInfo
            << ", Account ID: " << row.AccountID
            << ", Account PW: " << row.AccountPW
            << ", Platform: " << row.Platform << endl;
    }
}

int main() {
    // UTF-8 출력을 위한 설정 (Windows에서 필요)
#ifdef _WIN32
    SetConsoleOutputCP(CP_UTF8);
#endif

    sqlite3* db = openDatabase("AccountData.db");
    if (db == nullptr) return 1;

    // 테이블 생성
    createTables(db);

    char choice;
    while (true) {
        cout << "Select an option:\n";
        cout << "A: Insert Data\n";
        cout << "B: Query Data\n";
        cout << "C: Delete Data\n";
        cout << "D: Exit Program\n";
        cin >> choice;

        if (choice == 'A' || choice == 'a') {
            // 데이터 삽입
            string tableName, accountInfo, accountID, accountPW, platform;
            cout << "Enter table name (Main, RPGs, Managements, Else): ";
            cin >> tableName;
            cout << "Enter Account Info: ";
            cin >> accountInfo;
            cout << "Enter Account ID: ";
            cin >> accountID;
            cout << "Enter Account PW: ";
            cin >> accountPW;
            cout << "Enter Platform: ";
            cin >> platform;

            insertData(db, tableName.c_str(), accountInfo.c_str(), accountID.c_str(), accountPW.c_str(), platform.c_str());

        }
        else if (choice == 'B' || choice == 'b') {
            // 데이터 조회
            string tableName;
            cout << "Enter table name (Main, RPGs, Managements, Else): ";
            cin >> tableName;

            vector<Row> rows;
            readData(db, tableName.c_str(), rows);
            if (rows.empty()) {
                cout << "No data found." << endl;
            }
            else {
                printData(rows);
            }

        }
        else if (choice == 'C' || choice == 'c') {
            // 데이터 삭제
            string tableName, id;
            cout << "Enter table name (Main, RPGs, Managements, Else): ";
            cin >> tableName;
            cout << "Enter the Id of the row to delete: ";
            cin >> id;

            deleteData(db, tableName.c_str(), id.c_str());

        }
        else if (choice == 'D' || choice == 'd') {
            // 프로그램 종료
            break;
        }
        else {
            cout << "Invalid option, please try again." << endl;
        }
    }

    // 데이터베이스 닫기
    sqlite3_close(db);
    return 0;
}
