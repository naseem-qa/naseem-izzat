DROP TABLE IF EXISTS goods;
CREATE TABLE goods
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    brand VARCHAR(255),
    image_link VARCHAR(255),
    category VARCHAR(255),
    price VARCHAR(255),
    description text,
    product_link VARCHAR(255)
);

