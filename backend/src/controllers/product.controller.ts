import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { productName: 'asc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id as string) }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { productName, sku, category, description, price, gst } = req.body;
    let productImage = null;
    if (req.file) {
      productImage = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.create({
      data: {
        productName,
        sku,
        category,
        description,
        price: parseFloat(price),
        gst: parseFloat(gst || '0'),
        productImage
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productName, sku, category, description, price, gst } = req.body;
    const updateData: any = {
      productName,
      sku,
      category,
      description,
      price: price ? parseFloat(price) : undefined,
      gst: gst ? parseFloat(gst) : undefined
    };

    if (req.file) {
      updateData.productImage = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id as string) },
      data: updateData
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
