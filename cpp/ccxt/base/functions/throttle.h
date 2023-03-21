#pragma once

#include <string>
#include <map>

class Throttle
{
public:
    Throttle(double refillRate = 1.0, 
             double delay = 0.001, 
             double capacity = 1.0,
             int maxCapacity = 2000,
             int tokens = 0,
             double cost = 1.0
             );
    
private:
    double _refillRate;
    double _delay;
    double _capacity;
    int _maxCapacity;
    int _tokens;
    double _cost;
    std::map<std::string, std::string> _queue;
    bool _running = false;
};