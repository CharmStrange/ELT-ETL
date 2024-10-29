#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define PAGE_SIZE 256  // 페이지 크기 (예: 256바이트)
#define NUM_PAGES 4    // 총 4개 페이지 (총 1KB 가상 메모리)
#define CACHE_SIZE 2   // 캐시 크기 (예: 2개 페이지)

typedef struct {
    char name[20];
    int quantity;
    float price;
} Item;

typedef struct {
    int page_id;       // 페이지 번호
    Item* data;        // 페이지에 저장된 데이터
    int is_valid;      // 페이지 유효성 여부
    int is_dirty;      // 페이지 변경 여부 (디스크와 동기화 필요 여부)
} Page;

Page virtual_memory[NUM_PAGES];  // 가상 메모리
Page cache[CACHE_SIZE];          // 캐시 (메모리 상의 페이지들)

FILE* disk_file;                 // 디스크 파일 (스와핑 대상)

// 로그 기록
FILE* log_file;

void init_memory() {
    for (int i = 0; i < NUM_PAGES; i++) {
        virtual_memory[i].page_id = i;
        virtual_memory[i].data = (Item*)malloc(sizeof(Item));
        virtual_memory[i].is_valid = 0;
        virtual_memory[i].is_dirty = 0;
    }

    for (int i = 0; i < CACHE_SIZE; i++) {
        cache[i].page_id = -1;  // 캐시는 비어 있음
        cache[i].data = NULL;
        cache[i].is_valid = 0;
        cache[i].is_dirty = 0;
    }

    // 디스크 파일과 로그 파일을 생성
    disk_file = fopen("disk_swap.bin", "wb+");
    log_file = fopen("log.txt", "w");
    fprintf(log_file, "메모리 시스템 시작\n");
}

void log_event(const char* event) {
    fprintf(log_file, "이벤트: %s\n", event);
}

Page* find_in_cache(int page_id) {
    for (int i = 0; i < CACHE_SIZE; i++) {
        if (cache[i].page_id == page_id) {
            log_event("캐시 히트");
            return &cache[i];
        }
    }
    log_event("캐시 미스");
    return NULL;
}

void swap_out_page(int cache_index) {
    // 더티 페이지는 디스크에 저장
    if (cache[cache_index].is_dirty) {
        fseek(disk_file, cache[cache_index].page_id * PAGE_SIZE, SEEK_SET);
        fwrite(cache[cache_index].data, sizeof(Item), 1, disk_file);
        log_event("페이지 스와핑: 디스크로 페이지 내보내기");
        cache[cache_index].is_dirty = 0;
    }
    cache[cache_index].is_valid = 0;
}

void load_page_from_disk(int page_id, int cache_index) {
    fseek(disk_file, page_id * PAGE_SIZE, SEEK_SET);
    fread(virtual_memory[page_id].data, sizeof(Item), 1, disk_file);
    cache[cache_index] = virtual_memory[page_id];
    cache[cache_index].is_valid = 1;
    log_event("페이지 로딩: 디스크에서 페이지 가져오기");
}

void access_page(int page_id) {
    Page* page = find_in_cache(page_id);
    
    // 캐시에 없으면 페이지를 디스크에서 불러옴
    if (!page) {
        int cache_index = rand() % CACHE_SIZE;  // 간단하게 랜덤으로 스와핑
        swap_out_page(cache_index);
        load_page_from_disk(page_id, cache_index);
        page = &cache[cache_index];
    }

    // 페이지 사용
    printf("페이지 %d 사용\n", page_id);
    log_event("페이지 접근");
}

void addItem(int page_id, const char* name, int quantity, float price) {
    access_page(page_id);
    
    strcpy(virtual_memory[page_id].data->name, name);
    virtual_memory[page_id].data->quantity = quantity;
    virtual_memory[page_id].data->price = price;
    
    // 데이터가 변경되었으므로 더티 플래그 설정
    virtual_memory[page_id].is_dirty = 1;
    log_event("항목 추가");
}

void free_memory() {
    for (int i = 0; i < NUM_PAGES; i++) {
        free(virtual_memory[i].data);
    }

    fclose(disk_file);
    fprintf(log_file, "메모리 시스템 종료\n");
    fclose(log_file);
}

int main() {
    init_memory();
    
    addItem(0, "Item1", 10, 1.99);
    addItem(1, "Item2", 5, 3.49);
    
    access_page(0);  // 캐시 히트
    access_page(2);  // 캐시 미스 -> 스와핑 발생

    free_memory();
    return 0;
}
