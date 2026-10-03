package io.github.ccxt.base;

import java.util.AbstractList;
import java.util.RandomAccess;

// typed [first, second] result of the handle*AndParams helpers; still reads as the two-element list
public final class Pair<A, B> extends AbstractList<Object> implements RandomAccess {
    private final A first;
    private final B second;

    public Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    public A first() {
        return this.first;
    }

    public B second() {
        return this.second;
    }

    @Override
    public Object get(int index) {
        if (index == 0) {
            return this.first;
        }
        if (index == 1) {
            return this.second;
        }
        throw new IndexOutOfBoundsException("Index: " + index + ", Size: 2");
    }

    @Override
    public int size() {
        return 2;
    }
}
