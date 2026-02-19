import { MovementForm } from '../components/MovementForm'
import { ProductForm } from '../components/ProductForm'

export function FormsPage({
  productForm,
  productErrors,
  onProductInputChange,
  onProductSubmit,
  onCancelEdit,
  isEditing,
  canManageProducts,
  movementForm,
  movementErrors,
  products,
  onMovementInputChange,
  onMovementSubmit
}) {
  return (
    <section className="row g-4">
      <div className="col-xl-6">
        <ProductForm
          form={productForm}
          errors={productErrors}
          onChange={onProductInputChange}
          onSubmit={onProductSubmit}
          onCancelEdit={onCancelEdit}
          isEditing={isEditing}
          canManage={canManageProducts}
        />
      </div>
      <div className="col-xl-6">
        <MovementForm
          form={movementForm}
          errors={movementErrors}
          products={products}
          onChange={onMovementInputChange}
          onSubmit={onMovementSubmit}
        />
      </div>
    </section>
  )
}
