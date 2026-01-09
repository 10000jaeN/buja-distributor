import Image from "next/image";

import { Product } from "@/types/product";
import noImage from "@/public/images/no-image.png";
import Link from "next/link";

const ProductList = ({ products }: { products: Product[] }) => {
  return (
    <>
      {products &&
        products.map((product) => (
          <li
            key={product._id}
            className="mx-auto mb-4 flex w-[45vw] flex-col gap-2 transition-normal duration-100 md:w-[30vw]"
          >
            <Link href={`/product/${product.slug}`}>
              <Image
                src={product.thumbnail[0] || noImage}
                alt="thumbnail"
                width={0}
                height={0}
                sizes="45vw"
                className="h-auto w-full rounded-lg"
              />
              <div className="flex flex-col items-start text-[12px]">
                <div>{product.name}</div>
                <div className="text-[12px] font-bold">
                  {product.price.toLocaleString()}원
                </div>
              </div>
            </Link>
          </li>
        ))}
    </>
  );
};

export default ProductList;
