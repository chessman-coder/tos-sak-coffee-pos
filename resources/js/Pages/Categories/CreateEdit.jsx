import Breadcrumb from '@/Components/Breadcrumb';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

export default function CategoriesCreateEdit({ datas = {}, parentCategories = [] }) {
    const {
        data: categoryData,
        setData: setCategoryData,
        post: postCategory,
        patch: patchCategory,
        errors: categoryErrors,
        reset: resetCategory,
        processing: categoryProcessing,
    } = useForm({
        name: datas?.name ? datas.name : '',
        parent_id: datas?.parent_id ?? '',
    });

    const {
        data: subCategoryData,
        setData: setSubCategoryData,
        post: postSubCategory,
        errors: subCategoryErrors,
        reset: resetSubCategory,
        processing: subCategoryProcessing,
    } = useForm({
        name: '',
        parent_id: '',
    });

    const submitCategory = (e) => {
        e.preventDefault();

        if (!datas.id) {
            postCategory(route('categories.store'), {
                preserveState: true,
                onFinish: () => resetCategory(),
            });
        } else {
            patchCategory(route('categories.update', datas.id), {
                onFinish: () => resetCategory(),
            });
        }
    };

    const submitSubCategory = (e) => {
        e.preventDefault();
        postSubCategory(route('categories.store'), {
            preserveState: true,
            onSuccess: () => resetSubCategory(),
            onFinish: () => resetSubCategory(),
        });
    };

    const headWeb = 'Category Management';
    const linksBreadcrumb = [{ title: 'Home', url: '/' }, { title: headWeb, url: '' }];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={headWeb} links={linksBreadcrumb} />}>
            <Head title={headWeb} />
            <section className="content">
                <div className="row">
                    <div className="col-md-6">
                        <div className="card card-outline card-info h-full">
                            <div className="card-header">
                                <h3 className="card-title">Category Form</h3>
                            </div>
                            <form onSubmit={submitCategory}>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="category-name">
                                            <span className="text-danger">*</span>Category Name
                                        </label>
                                        <input
                                            value={categoryData.name}
                                            onChange={(e) => setCategoryData('name', e.target.value)}
                                            type="text"
                                            name="name"
                                            className={`form-control ${categoryErrors.name ? 'is-invalid' : ''}`}
                                            id="category-name"
                                        />
                                        <InputError className="mt-2" message={categoryErrors.name} />
                                    </div>
                                </div>
                                <div className="card-footer clearfix">
                                    <button disabled={categoryProcessing} type="submit" className="btn btn-primary">
                                        {categoryProcessing ? (datas?.id ? 'Updating...' : 'Saving...') : (datas?.id ? 'Update' : 'Save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card card-outline card-info h-full">
                            <div className="card-header">
                                <h3 className="card-title">Sub-Category Form</h3>
                            </div>
                            <form onSubmit={submitSubCategory}>
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="sub-category-name">
                                            <span className="text-danger">*</span>Sub-Category Name
                                        </label>
                                        <input
                                            value={subCategoryData.name}
                                            onChange={(e) => setSubCategoryData('name', e.target.value)}
                                            type="text"
                                            name="name"
                                            className={`form-control ${subCategoryErrors.name ? 'is-invalid' : ''}`}
                                            id="sub-category-name"
                                        />
                                        <InputError className="mt-2" message={subCategoryErrors.name} />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-uppercase" htmlFor="parent_id">
                                            <span className="text-danger">*</span>Category
                                        </label>
                                        <select
                                            value={subCategoryData.parent_id}
                                            onChange={(e) => setSubCategoryData('parent_id', e.target.value)}
                                            name="parent_id"
                                            id="parent_id"
                                            className={`form-control ${subCategoryErrors.parent_id ? 'is-invalid' : ''}`}
                                        >
                                            <option value="">Select category</option>
                                            {parentCategories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError className="mt-2" message={subCategoryErrors.parent_id} />
                                    </div>
                                </div>
                                <div className="card-footer clearfix">
                                    <button disabled={subCategoryProcessing} type="submit" className="btn btn-primary">
                                        {subCategoryProcessing ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}