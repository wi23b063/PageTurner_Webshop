<?php

class Product {
    public int $id;
    public string $name;
    public string $description;
    public float $rating;
    public float $price;
    public string $image;

    public function __construct(
        int $id,
        string $name,
        string $description,
        float $rating,
        float $price,
        string $image
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->description = $description;
        $this->rating = $rating;
        $this->price = $price;
        $this->image = $image;
    }
}

