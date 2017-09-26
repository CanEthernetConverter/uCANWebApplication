project(ucan_cpp_lib)
cmake_minimum_required(VERSION 2.8)
aux_source_directory(./src/ SRC_LIST)
aux_source_directory(./tests/ SRC_TESTS)


file(GLOB TESTS_DATA
  "/tests/tests_data/*"
)

file(COPY ${TESTS_DATA} DESTINATION ${CMAKE_CURRENT_BINARY_DIR})

set(THREADS_PREFER_PTHREAD_FLAG ON)
find_package(Threads REQUIRED)
link_libraries(${CMAKE_THREAD_LIBS_INIT})
set (CMAKE_CXX_FLAGS "-g -std=c++14")
add_executable(${PROJECT_NAME} ${SRC_LIST} ${SRC_TESTS})

target_link_libraries(${PROJECT_NAME} Threads::Threads)


add_subdirectory(examples)
