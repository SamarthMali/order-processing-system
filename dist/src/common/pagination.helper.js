"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = paginate;
function paginate(items, totalItems, page, limit) {
    return {
        items,
        meta: {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        },
    };
}
//# sourceMappingURL=pagination.helper.js.map