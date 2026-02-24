float calculate_speed(float current_speed, int input){
    float acceleration = 0.02f;

    if(input == 1){
        current_speed += acceleration;
    }

    // 最大速度制限
    if(current_speed > 0.5f){
        current_speed = 0.5f;
    }

    return current_speed;
}
