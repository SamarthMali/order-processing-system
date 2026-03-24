import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type OrderAuditLogModel = runtime.Types.Result.DefaultSelection<Prisma.$OrderAuditLogPayload>;
export type AggregateOrderAuditLog = {
    _count: OrderAuditLogCountAggregateOutputType | null;
    _avg: OrderAuditLogAvgAggregateOutputType | null;
    _sum: OrderAuditLogSumAggregateOutputType | null;
    _min: OrderAuditLogMinAggregateOutputType | null;
    _max: OrderAuditLogMaxAggregateOutputType | null;
};
export type OrderAuditLogAvgAggregateOutputType = {
    id: number | null;
    orderId: number | null;
    performedById: number | null;
};
export type OrderAuditLogSumAggregateOutputType = {
    id: number | null;
    orderId: number | null;
    performedById: number | null;
};
export type OrderAuditLogMinAggregateOutputType = {
    id: number | null;
    orderId: number | null;
    action: string | null;
    oldStatus: string | null;
    newStatus: string | null;
    performedById: number | null;
    performedByRole: string | null;
    note: string | null;
    createdAt: Date | null;
};
export type OrderAuditLogMaxAggregateOutputType = {
    id: number | null;
    orderId: number | null;
    action: string | null;
    oldStatus: string | null;
    newStatus: string | null;
    performedById: number | null;
    performedByRole: string | null;
    note: string | null;
    createdAt: Date | null;
};
export type OrderAuditLogCountAggregateOutputType = {
    id: number;
    orderId: number;
    action: number;
    oldStatus: number;
    newStatus: number;
    performedById: number;
    performedByRole: number;
    note: number;
    createdAt: number;
    _all: number;
};
export type OrderAuditLogAvgAggregateInputType = {
    id?: true;
    orderId?: true;
    performedById?: true;
};
export type OrderAuditLogSumAggregateInputType = {
    id?: true;
    orderId?: true;
    performedById?: true;
};
export type OrderAuditLogMinAggregateInputType = {
    id?: true;
    orderId?: true;
    action?: true;
    oldStatus?: true;
    newStatus?: true;
    performedById?: true;
    performedByRole?: true;
    note?: true;
    createdAt?: true;
};
export type OrderAuditLogMaxAggregateInputType = {
    id?: true;
    orderId?: true;
    action?: true;
    oldStatus?: true;
    newStatus?: true;
    performedById?: true;
    performedByRole?: true;
    note?: true;
    createdAt?: true;
};
export type OrderAuditLogCountAggregateInputType = {
    id?: true;
    orderId?: true;
    action?: true;
    oldStatus?: true;
    newStatus?: true;
    performedById?: true;
    performedByRole?: true;
    note?: true;
    createdAt?: true;
    _all?: true;
};
export type OrderAuditLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrderAuditLogWhereInput;
    orderBy?: Prisma.OrderAuditLogOrderByWithRelationInput | Prisma.OrderAuditLogOrderByWithRelationInput[];
    cursor?: Prisma.OrderAuditLogWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | OrderAuditLogCountAggregateInputType;
    _avg?: OrderAuditLogAvgAggregateInputType;
    _sum?: OrderAuditLogSumAggregateInputType;
    _min?: OrderAuditLogMinAggregateInputType;
    _max?: OrderAuditLogMaxAggregateInputType;
};
export type GetOrderAuditLogAggregateType<T extends OrderAuditLogAggregateArgs> = {
    [P in keyof T & keyof AggregateOrderAuditLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOrderAuditLog[P]> : Prisma.GetScalarType<T[P], AggregateOrderAuditLog[P]>;
};
export type OrderAuditLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrderAuditLogWhereInput;
    orderBy?: Prisma.OrderAuditLogOrderByWithAggregationInput | Prisma.OrderAuditLogOrderByWithAggregationInput[];
    by: Prisma.OrderAuditLogScalarFieldEnum[] | Prisma.OrderAuditLogScalarFieldEnum;
    having?: Prisma.OrderAuditLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OrderAuditLogCountAggregateInputType | true;
    _avg?: OrderAuditLogAvgAggregateInputType;
    _sum?: OrderAuditLogSumAggregateInputType;
    _min?: OrderAuditLogMinAggregateInputType;
    _max?: OrderAuditLogMaxAggregateInputType;
};
export type OrderAuditLogGroupByOutputType = {
    id: number;
    orderId: number;
    action: string;
    oldStatus: string | null;
    newStatus: string;
    performedById: number | null;
    performedByRole: string | null;
    note: string | null;
    createdAt: Date;
    _count: OrderAuditLogCountAggregateOutputType | null;
    _avg: OrderAuditLogAvgAggregateOutputType | null;
    _sum: OrderAuditLogSumAggregateOutputType | null;
    _min: OrderAuditLogMinAggregateOutputType | null;
    _max: OrderAuditLogMaxAggregateOutputType | null;
};
type GetOrderAuditLogGroupByPayload<T extends OrderAuditLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OrderAuditLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OrderAuditLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OrderAuditLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OrderAuditLogGroupByOutputType[P]>;
}>>;
export type OrderAuditLogWhereInput = {
    AND?: Prisma.OrderAuditLogWhereInput | Prisma.OrderAuditLogWhereInput[];
    OR?: Prisma.OrderAuditLogWhereInput[];
    NOT?: Prisma.OrderAuditLogWhereInput | Prisma.OrderAuditLogWhereInput[];
    id?: Prisma.IntFilter<"OrderAuditLog"> | number;
    orderId?: Prisma.IntFilter<"OrderAuditLog"> | number;
    action?: Prisma.StringFilter<"OrderAuditLog"> | string;
    oldStatus?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    newStatus?: Prisma.StringFilter<"OrderAuditLog"> | string;
    performedById?: Prisma.IntNullableFilter<"OrderAuditLog"> | number | null;
    performedByRole?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    note?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"OrderAuditLog"> | Date | string;
    order?: Prisma.XOR<Prisma.OrderScalarRelationFilter, Prisma.OrderWhereInput>;
    performedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
};
export type OrderAuditLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    orderId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrderInput | Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    performedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    performedByRole?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    order?: Prisma.OrderOrderByWithRelationInput;
    performedBy?: Prisma.UserOrderByWithRelationInput;
};
export type OrderAuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.OrderAuditLogWhereInput | Prisma.OrderAuditLogWhereInput[];
    OR?: Prisma.OrderAuditLogWhereInput[];
    NOT?: Prisma.OrderAuditLogWhereInput | Prisma.OrderAuditLogWhereInput[];
    orderId?: Prisma.IntFilter<"OrderAuditLog"> | number;
    action?: Prisma.StringFilter<"OrderAuditLog"> | string;
    oldStatus?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    newStatus?: Prisma.StringFilter<"OrderAuditLog"> | string;
    performedById?: Prisma.IntNullableFilter<"OrderAuditLog"> | number | null;
    performedByRole?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    note?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"OrderAuditLog"> | Date | string;
    order?: Prisma.XOR<Prisma.OrderScalarRelationFilter, Prisma.OrderWhereInput>;
    performedBy?: Prisma.XOR<Prisma.UserNullableScalarRelationFilter, Prisma.UserWhereInput> | null;
}, "id">;
export type OrderAuditLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    orderId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrderInput | Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    performedById?: Prisma.SortOrderInput | Prisma.SortOrder;
    performedByRole?: Prisma.SortOrderInput | Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.OrderAuditLogCountOrderByAggregateInput;
    _avg?: Prisma.OrderAuditLogAvgOrderByAggregateInput;
    _max?: Prisma.OrderAuditLogMaxOrderByAggregateInput;
    _min?: Prisma.OrderAuditLogMinOrderByAggregateInput;
    _sum?: Prisma.OrderAuditLogSumOrderByAggregateInput;
};
export type OrderAuditLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.OrderAuditLogScalarWhereWithAggregatesInput | Prisma.OrderAuditLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.OrderAuditLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.OrderAuditLogScalarWhereWithAggregatesInput | Prisma.OrderAuditLogScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"OrderAuditLog"> | number;
    orderId?: Prisma.IntWithAggregatesFilter<"OrderAuditLog"> | number;
    action?: Prisma.StringWithAggregatesFilter<"OrderAuditLog"> | string;
    oldStatus?: Prisma.StringNullableWithAggregatesFilter<"OrderAuditLog"> | string | null;
    newStatus?: Prisma.StringWithAggregatesFilter<"OrderAuditLog"> | string;
    performedById?: Prisma.IntNullableWithAggregatesFilter<"OrderAuditLog"> | number | null;
    performedByRole?: Prisma.StringNullableWithAggregatesFilter<"OrderAuditLog"> | string | null;
    note?: Prisma.StringNullableWithAggregatesFilter<"OrderAuditLog"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"OrderAuditLog"> | Date | string;
};
export type OrderAuditLogCreateInput = {
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    order: Prisma.OrderCreateNestedOneWithoutAuditLogsInput;
    performedBy?: Prisma.UserCreateNestedOneWithoutAuditLogsInput;
};
export type OrderAuditLogUncheckedCreateInput = {
    id?: number;
    orderId: number;
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedById?: number | null;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
};
export type OrderAuditLogUpdateInput = {
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    order?: Prisma.OrderUpdateOneRequiredWithoutAuditLogsNestedInput;
    performedBy?: Prisma.UserUpdateOneWithoutAuditLogsNestedInput;
};
export type OrderAuditLogUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    orderId?: Prisma.IntFieldUpdateOperationsInput | number;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedById?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrderAuditLogCreateManyInput = {
    id?: number;
    orderId: number;
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedById?: number | null;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
};
export type OrderAuditLogUpdateManyMutationInput = {
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrderAuditLogUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    orderId?: Prisma.IntFieldUpdateOperationsInput | number;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedById?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrderAuditLogListRelationFilter = {
    every?: Prisma.OrderAuditLogWhereInput;
    some?: Prisma.OrderAuditLogWhereInput;
    none?: Prisma.OrderAuditLogWhereInput;
};
export type OrderAuditLogOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type OrderAuditLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    orderId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    performedById?: Prisma.SortOrder;
    performedByRole?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type OrderAuditLogAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    orderId?: Prisma.SortOrder;
    performedById?: Prisma.SortOrder;
};
export type OrderAuditLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    orderId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    performedById?: Prisma.SortOrder;
    performedByRole?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type OrderAuditLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    orderId?: Prisma.SortOrder;
    action?: Prisma.SortOrder;
    oldStatus?: Prisma.SortOrder;
    newStatus?: Prisma.SortOrder;
    performedById?: Prisma.SortOrder;
    performedByRole?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type OrderAuditLogSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    orderId?: Prisma.SortOrder;
    performedById?: Prisma.SortOrder;
};
export type OrderAuditLogCreateNestedManyWithoutPerformedByInput = {
    create?: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutPerformedByInput, Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput> | Prisma.OrderAuditLogCreateWithoutPerformedByInput[] | Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput[];
    connectOrCreate?: Prisma.OrderAuditLogCreateOrConnectWithoutPerformedByInput | Prisma.OrderAuditLogCreateOrConnectWithoutPerformedByInput[];
    createMany?: Prisma.OrderAuditLogCreateManyPerformedByInputEnvelope;
    connect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
};
export type OrderAuditLogUncheckedCreateNestedManyWithoutPerformedByInput = {
    create?: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutPerformedByInput, Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput> | Prisma.OrderAuditLogCreateWithoutPerformedByInput[] | Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput[];
    connectOrCreate?: Prisma.OrderAuditLogCreateOrConnectWithoutPerformedByInput | Prisma.OrderAuditLogCreateOrConnectWithoutPerformedByInput[];
    createMany?: Prisma.OrderAuditLogCreateManyPerformedByInputEnvelope;
    connect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
};
export type OrderAuditLogUpdateManyWithoutPerformedByNestedInput = {
    create?: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutPerformedByInput, Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput> | Prisma.OrderAuditLogCreateWithoutPerformedByInput[] | Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput[];
    connectOrCreate?: Prisma.OrderAuditLogCreateOrConnectWithoutPerformedByInput | Prisma.OrderAuditLogCreateOrConnectWithoutPerformedByInput[];
    upsert?: Prisma.OrderAuditLogUpsertWithWhereUniqueWithoutPerformedByInput | Prisma.OrderAuditLogUpsertWithWhereUniqueWithoutPerformedByInput[];
    createMany?: Prisma.OrderAuditLogCreateManyPerformedByInputEnvelope;
    set?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    disconnect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    delete?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    connect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    update?: Prisma.OrderAuditLogUpdateWithWhereUniqueWithoutPerformedByInput | Prisma.OrderAuditLogUpdateWithWhereUniqueWithoutPerformedByInput[];
    updateMany?: Prisma.OrderAuditLogUpdateManyWithWhereWithoutPerformedByInput | Prisma.OrderAuditLogUpdateManyWithWhereWithoutPerformedByInput[];
    deleteMany?: Prisma.OrderAuditLogScalarWhereInput | Prisma.OrderAuditLogScalarWhereInput[];
};
export type OrderAuditLogUncheckedUpdateManyWithoutPerformedByNestedInput = {
    create?: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutPerformedByInput, Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput> | Prisma.OrderAuditLogCreateWithoutPerformedByInput[] | Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput[];
    connectOrCreate?: Prisma.OrderAuditLogCreateOrConnectWithoutPerformedByInput | Prisma.OrderAuditLogCreateOrConnectWithoutPerformedByInput[];
    upsert?: Prisma.OrderAuditLogUpsertWithWhereUniqueWithoutPerformedByInput | Prisma.OrderAuditLogUpsertWithWhereUniqueWithoutPerformedByInput[];
    createMany?: Prisma.OrderAuditLogCreateManyPerformedByInputEnvelope;
    set?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    disconnect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    delete?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    connect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    update?: Prisma.OrderAuditLogUpdateWithWhereUniqueWithoutPerformedByInput | Prisma.OrderAuditLogUpdateWithWhereUniqueWithoutPerformedByInput[];
    updateMany?: Prisma.OrderAuditLogUpdateManyWithWhereWithoutPerformedByInput | Prisma.OrderAuditLogUpdateManyWithWhereWithoutPerformedByInput[];
    deleteMany?: Prisma.OrderAuditLogScalarWhereInput | Prisma.OrderAuditLogScalarWhereInput[];
};
export type OrderAuditLogCreateNestedManyWithoutOrderInput = {
    create?: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutOrderInput, Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput> | Prisma.OrderAuditLogCreateWithoutOrderInput[] | Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput[];
    connectOrCreate?: Prisma.OrderAuditLogCreateOrConnectWithoutOrderInput | Prisma.OrderAuditLogCreateOrConnectWithoutOrderInput[];
    createMany?: Prisma.OrderAuditLogCreateManyOrderInputEnvelope;
    connect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
};
export type OrderAuditLogUncheckedCreateNestedManyWithoutOrderInput = {
    create?: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutOrderInput, Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput> | Prisma.OrderAuditLogCreateWithoutOrderInput[] | Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput[];
    connectOrCreate?: Prisma.OrderAuditLogCreateOrConnectWithoutOrderInput | Prisma.OrderAuditLogCreateOrConnectWithoutOrderInput[];
    createMany?: Prisma.OrderAuditLogCreateManyOrderInputEnvelope;
    connect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
};
export type OrderAuditLogUpdateManyWithoutOrderNestedInput = {
    create?: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutOrderInput, Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput> | Prisma.OrderAuditLogCreateWithoutOrderInput[] | Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput[];
    connectOrCreate?: Prisma.OrderAuditLogCreateOrConnectWithoutOrderInput | Prisma.OrderAuditLogCreateOrConnectWithoutOrderInput[];
    upsert?: Prisma.OrderAuditLogUpsertWithWhereUniqueWithoutOrderInput | Prisma.OrderAuditLogUpsertWithWhereUniqueWithoutOrderInput[];
    createMany?: Prisma.OrderAuditLogCreateManyOrderInputEnvelope;
    set?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    disconnect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    delete?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    connect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    update?: Prisma.OrderAuditLogUpdateWithWhereUniqueWithoutOrderInput | Prisma.OrderAuditLogUpdateWithWhereUniqueWithoutOrderInput[];
    updateMany?: Prisma.OrderAuditLogUpdateManyWithWhereWithoutOrderInput | Prisma.OrderAuditLogUpdateManyWithWhereWithoutOrderInput[];
    deleteMany?: Prisma.OrderAuditLogScalarWhereInput | Prisma.OrderAuditLogScalarWhereInput[];
};
export type OrderAuditLogUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutOrderInput, Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput> | Prisma.OrderAuditLogCreateWithoutOrderInput[] | Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput[];
    connectOrCreate?: Prisma.OrderAuditLogCreateOrConnectWithoutOrderInput | Prisma.OrderAuditLogCreateOrConnectWithoutOrderInput[];
    upsert?: Prisma.OrderAuditLogUpsertWithWhereUniqueWithoutOrderInput | Prisma.OrderAuditLogUpsertWithWhereUniqueWithoutOrderInput[];
    createMany?: Prisma.OrderAuditLogCreateManyOrderInputEnvelope;
    set?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    disconnect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    delete?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    connect?: Prisma.OrderAuditLogWhereUniqueInput | Prisma.OrderAuditLogWhereUniqueInput[];
    update?: Prisma.OrderAuditLogUpdateWithWhereUniqueWithoutOrderInput | Prisma.OrderAuditLogUpdateWithWhereUniqueWithoutOrderInput[];
    updateMany?: Prisma.OrderAuditLogUpdateManyWithWhereWithoutOrderInput | Prisma.OrderAuditLogUpdateManyWithWhereWithoutOrderInput[];
    deleteMany?: Prisma.OrderAuditLogScalarWhereInput | Prisma.OrderAuditLogScalarWhereInput[];
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type OrderAuditLogCreateWithoutPerformedByInput = {
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    order: Prisma.OrderCreateNestedOneWithoutAuditLogsInput;
};
export type OrderAuditLogUncheckedCreateWithoutPerformedByInput = {
    id?: number;
    orderId: number;
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
};
export type OrderAuditLogCreateOrConnectWithoutPerformedByInput = {
    where: Prisma.OrderAuditLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutPerformedByInput, Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput>;
};
export type OrderAuditLogCreateManyPerformedByInputEnvelope = {
    data: Prisma.OrderAuditLogCreateManyPerformedByInput | Prisma.OrderAuditLogCreateManyPerformedByInput[];
};
export type OrderAuditLogUpsertWithWhereUniqueWithoutPerformedByInput = {
    where: Prisma.OrderAuditLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.OrderAuditLogUpdateWithoutPerformedByInput, Prisma.OrderAuditLogUncheckedUpdateWithoutPerformedByInput>;
    create: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutPerformedByInput, Prisma.OrderAuditLogUncheckedCreateWithoutPerformedByInput>;
};
export type OrderAuditLogUpdateWithWhereUniqueWithoutPerformedByInput = {
    where: Prisma.OrderAuditLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.OrderAuditLogUpdateWithoutPerformedByInput, Prisma.OrderAuditLogUncheckedUpdateWithoutPerformedByInput>;
};
export type OrderAuditLogUpdateManyWithWhereWithoutPerformedByInput = {
    where: Prisma.OrderAuditLogScalarWhereInput;
    data: Prisma.XOR<Prisma.OrderAuditLogUpdateManyMutationInput, Prisma.OrderAuditLogUncheckedUpdateManyWithoutPerformedByInput>;
};
export type OrderAuditLogScalarWhereInput = {
    AND?: Prisma.OrderAuditLogScalarWhereInput | Prisma.OrderAuditLogScalarWhereInput[];
    OR?: Prisma.OrderAuditLogScalarWhereInput[];
    NOT?: Prisma.OrderAuditLogScalarWhereInput | Prisma.OrderAuditLogScalarWhereInput[];
    id?: Prisma.IntFilter<"OrderAuditLog"> | number;
    orderId?: Prisma.IntFilter<"OrderAuditLog"> | number;
    action?: Prisma.StringFilter<"OrderAuditLog"> | string;
    oldStatus?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    newStatus?: Prisma.StringFilter<"OrderAuditLog"> | string;
    performedById?: Prisma.IntNullableFilter<"OrderAuditLog"> | number | null;
    performedByRole?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    note?: Prisma.StringNullableFilter<"OrderAuditLog"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"OrderAuditLog"> | Date | string;
};
export type OrderAuditLogCreateWithoutOrderInput = {
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
    performedBy?: Prisma.UserCreateNestedOneWithoutAuditLogsInput;
};
export type OrderAuditLogUncheckedCreateWithoutOrderInput = {
    id?: number;
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedById?: number | null;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
};
export type OrderAuditLogCreateOrConnectWithoutOrderInput = {
    where: Prisma.OrderAuditLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutOrderInput, Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput>;
};
export type OrderAuditLogCreateManyOrderInputEnvelope = {
    data: Prisma.OrderAuditLogCreateManyOrderInput | Prisma.OrderAuditLogCreateManyOrderInput[];
};
export type OrderAuditLogUpsertWithWhereUniqueWithoutOrderInput = {
    where: Prisma.OrderAuditLogWhereUniqueInput;
    update: Prisma.XOR<Prisma.OrderAuditLogUpdateWithoutOrderInput, Prisma.OrderAuditLogUncheckedUpdateWithoutOrderInput>;
    create: Prisma.XOR<Prisma.OrderAuditLogCreateWithoutOrderInput, Prisma.OrderAuditLogUncheckedCreateWithoutOrderInput>;
};
export type OrderAuditLogUpdateWithWhereUniqueWithoutOrderInput = {
    where: Prisma.OrderAuditLogWhereUniqueInput;
    data: Prisma.XOR<Prisma.OrderAuditLogUpdateWithoutOrderInput, Prisma.OrderAuditLogUncheckedUpdateWithoutOrderInput>;
};
export type OrderAuditLogUpdateManyWithWhereWithoutOrderInput = {
    where: Prisma.OrderAuditLogScalarWhereInput;
    data: Prisma.XOR<Prisma.OrderAuditLogUpdateManyMutationInput, Prisma.OrderAuditLogUncheckedUpdateManyWithoutOrderInput>;
};
export type OrderAuditLogCreateManyPerformedByInput = {
    id?: number;
    orderId: number;
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
};
export type OrderAuditLogUpdateWithoutPerformedByInput = {
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    order?: Prisma.OrderUpdateOneRequiredWithoutAuditLogsNestedInput;
};
export type OrderAuditLogUncheckedUpdateWithoutPerformedByInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    orderId?: Prisma.IntFieldUpdateOperationsInput | number;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrderAuditLogUncheckedUpdateManyWithoutPerformedByInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    orderId?: Prisma.IntFieldUpdateOperationsInput | number;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrderAuditLogCreateManyOrderInput = {
    id?: number;
    action: string;
    oldStatus?: string | null;
    newStatus: string;
    performedById?: number | null;
    performedByRole?: string | null;
    note?: string | null;
    createdAt?: Date | string;
};
export type OrderAuditLogUpdateWithoutOrderInput = {
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    performedBy?: Prisma.UserUpdateOneWithoutAuditLogsNestedInput;
};
export type OrderAuditLogUncheckedUpdateWithoutOrderInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedById?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrderAuditLogUncheckedUpdateManyWithoutOrderInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    action?: Prisma.StringFieldUpdateOperationsInput | string;
    oldStatus?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    newStatus?: Prisma.StringFieldUpdateOperationsInput | string;
    performedById?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    performedByRole?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrderAuditLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    orderId?: boolean;
    action?: boolean;
    oldStatus?: boolean;
    newStatus?: boolean;
    performedById?: boolean;
    performedByRole?: boolean;
    note?: boolean;
    createdAt?: boolean;
    order?: boolean | Prisma.OrderDefaultArgs<ExtArgs>;
    performedBy?: boolean | Prisma.OrderAuditLog$performedByArgs<ExtArgs>;
}, ExtArgs["result"]["orderAuditLog"]>;
export type OrderAuditLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    orderId?: boolean;
    action?: boolean;
    oldStatus?: boolean;
    newStatus?: boolean;
    performedById?: boolean;
    performedByRole?: boolean;
    note?: boolean;
    createdAt?: boolean;
    order?: boolean | Prisma.OrderDefaultArgs<ExtArgs>;
    performedBy?: boolean | Prisma.OrderAuditLog$performedByArgs<ExtArgs>;
}, ExtArgs["result"]["orderAuditLog"]>;
export type OrderAuditLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    orderId?: boolean;
    action?: boolean;
    oldStatus?: boolean;
    newStatus?: boolean;
    performedById?: boolean;
    performedByRole?: boolean;
    note?: boolean;
    createdAt?: boolean;
    order?: boolean | Prisma.OrderDefaultArgs<ExtArgs>;
    performedBy?: boolean | Prisma.OrderAuditLog$performedByArgs<ExtArgs>;
}, ExtArgs["result"]["orderAuditLog"]>;
export type OrderAuditLogSelectScalar = {
    id?: boolean;
    orderId?: boolean;
    action?: boolean;
    oldStatus?: boolean;
    newStatus?: boolean;
    performedById?: boolean;
    performedByRole?: boolean;
    note?: boolean;
    createdAt?: boolean;
};
export type OrderAuditLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "orderId" | "action" | "oldStatus" | "newStatus" | "performedById" | "performedByRole" | "note" | "createdAt", ExtArgs["result"]["orderAuditLog"]>;
export type OrderAuditLogInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    order?: boolean | Prisma.OrderDefaultArgs<ExtArgs>;
    performedBy?: boolean | Prisma.OrderAuditLog$performedByArgs<ExtArgs>;
};
export type OrderAuditLogIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    order?: boolean | Prisma.OrderDefaultArgs<ExtArgs>;
    performedBy?: boolean | Prisma.OrderAuditLog$performedByArgs<ExtArgs>;
};
export type OrderAuditLogIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    order?: boolean | Prisma.OrderDefaultArgs<ExtArgs>;
    performedBy?: boolean | Prisma.OrderAuditLog$performedByArgs<ExtArgs>;
};
export type $OrderAuditLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "OrderAuditLog";
    objects: {
        order: Prisma.$OrderPayload<ExtArgs>;
        performedBy: Prisma.$UserPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        orderId: number;
        action: string;
        oldStatus: string | null;
        newStatus: string;
        performedById: number | null;
        performedByRole: string | null;
        note: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["orderAuditLog"]>;
    composites: {};
};
export type OrderAuditLogGetPayload<S extends boolean | null | undefined | OrderAuditLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload, S>;
export type OrderAuditLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<OrderAuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OrderAuditLogCountAggregateInputType | true;
};
export interface OrderAuditLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['OrderAuditLog'];
        meta: {
            name: 'OrderAuditLog';
        };
    };
    findUnique<T extends OrderAuditLogFindUniqueArgs>(args: Prisma.SelectSubset<T, OrderAuditLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__OrderAuditLogClient<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends OrderAuditLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, OrderAuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrderAuditLogClient<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends OrderAuditLogFindFirstArgs>(args?: Prisma.SelectSubset<T, OrderAuditLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__OrderAuditLogClient<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends OrderAuditLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, OrderAuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__OrderAuditLogClient<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends OrderAuditLogFindManyArgs>(args?: Prisma.SelectSubset<T, OrderAuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends OrderAuditLogCreateArgs>(args: Prisma.SelectSubset<T, OrderAuditLogCreateArgs<ExtArgs>>): Prisma.Prisma__OrderAuditLogClient<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends OrderAuditLogCreateManyArgs>(args?: Prisma.SelectSubset<T, OrderAuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends OrderAuditLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, OrderAuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends OrderAuditLogDeleteArgs>(args: Prisma.SelectSubset<T, OrderAuditLogDeleteArgs<ExtArgs>>): Prisma.Prisma__OrderAuditLogClient<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends OrderAuditLogUpdateArgs>(args: Prisma.SelectSubset<T, OrderAuditLogUpdateArgs<ExtArgs>>): Prisma.Prisma__OrderAuditLogClient<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends OrderAuditLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, OrderAuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends OrderAuditLogUpdateManyArgs>(args: Prisma.SelectSubset<T, OrderAuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends OrderAuditLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, OrderAuditLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends OrderAuditLogUpsertArgs>(args: Prisma.SelectSubset<T, OrderAuditLogUpsertArgs<ExtArgs>>): Prisma.Prisma__OrderAuditLogClient<runtime.Types.Result.GetResult<Prisma.$OrderAuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends OrderAuditLogCountArgs>(args?: Prisma.Subset<T, OrderAuditLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OrderAuditLogCountAggregateOutputType> : number>;
    aggregate<T extends OrderAuditLogAggregateArgs>(args: Prisma.Subset<T, OrderAuditLogAggregateArgs>): Prisma.PrismaPromise<GetOrderAuditLogAggregateType<T>>;
    groupBy<T extends OrderAuditLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: OrderAuditLogGroupByArgs['orderBy'];
    } : {
        orderBy?: OrderAuditLogGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, OrderAuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: OrderAuditLogFieldRefs;
}
export interface Prisma__OrderAuditLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    order<T extends Prisma.OrderDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrderDefaultArgs<ExtArgs>>): Prisma.Prisma__OrderClient<runtime.Types.Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    performedBy<T extends Prisma.OrderAuditLog$performedByArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.OrderAuditLog$performedByArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface OrderAuditLogFieldRefs {
    readonly id: Prisma.FieldRef<"OrderAuditLog", 'Int'>;
    readonly orderId: Prisma.FieldRef<"OrderAuditLog", 'Int'>;
    readonly action: Prisma.FieldRef<"OrderAuditLog", 'String'>;
    readonly oldStatus: Prisma.FieldRef<"OrderAuditLog", 'String'>;
    readonly newStatus: Prisma.FieldRef<"OrderAuditLog", 'String'>;
    readonly performedById: Prisma.FieldRef<"OrderAuditLog", 'Int'>;
    readonly performedByRole: Prisma.FieldRef<"OrderAuditLog", 'String'>;
    readonly note: Prisma.FieldRef<"OrderAuditLog", 'String'>;
    readonly createdAt: Prisma.FieldRef<"OrderAuditLog", 'DateTime'>;
}
export type OrderAuditLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    where: Prisma.OrderAuditLogWhereUniqueInput;
};
export type OrderAuditLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    where: Prisma.OrderAuditLogWhereUniqueInput;
};
export type OrderAuditLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    where?: Prisma.OrderAuditLogWhereInput;
    orderBy?: Prisma.OrderAuditLogOrderByWithRelationInput | Prisma.OrderAuditLogOrderByWithRelationInput[];
    cursor?: Prisma.OrderAuditLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrderAuditLogScalarFieldEnum | Prisma.OrderAuditLogScalarFieldEnum[];
};
export type OrderAuditLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    where?: Prisma.OrderAuditLogWhereInput;
    orderBy?: Prisma.OrderAuditLogOrderByWithRelationInput | Prisma.OrderAuditLogOrderByWithRelationInput[];
    cursor?: Prisma.OrderAuditLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrderAuditLogScalarFieldEnum | Prisma.OrderAuditLogScalarFieldEnum[];
};
export type OrderAuditLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    where?: Prisma.OrderAuditLogWhereInput;
    orderBy?: Prisma.OrderAuditLogOrderByWithRelationInput | Prisma.OrderAuditLogOrderByWithRelationInput[];
    cursor?: Prisma.OrderAuditLogWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrderAuditLogScalarFieldEnum | Prisma.OrderAuditLogScalarFieldEnum[];
};
export type OrderAuditLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrderAuditLogCreateInput, Prisma.OrderAuditLogUncheckedCreateInput>;
};
export type OrderAuditLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.OrderAuditLogCreateManyInput | Prisma.OrderAuditLogCreateManyInput[];
};
export type OrderAuditLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    data: Prisma.OrderAuditLogCreateManyInput | Prisma.OrderAuditLogCreateManyInput[];
    include?: Prisma.OrderAuditLogIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type OrderAuditLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrderAuditLogUpdateInput, Prisma.OrderAuditLogUncheckedUpdateInput>;
    where: Prisma.OrderAuditLogWhereUniqueInput;
};
export type OrderAuditLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.OrderAuditLogUpdateManyMutationInput, Prisma.OrderAuditLogUncheckedUpdateManyInput>;
    where?: Prisma.OrderAuditLogWhereInput;
    limit?: number;
};
export type OrderAuditLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.OrderAuditLogUpdateManyMutationInput, Prisma.OrderAuditLogUncheckedUpdateManyInput>;
    where?: Prisma.OrderAuditLogWhereInput;
    limit?: number;
    include?: Prisma.OrderAuditLogIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type OrderAuditLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    where: Prisma.OrderAuditLogWhereUniqueInput;
    create: Prisma.XOR<Prisma.OrderAuditLogCreateInput, Prisma.OrderAuditLogUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.OrderAuditLogUpdateInput, Prisma.OrderAuditLogUncheckedUpdateInput>;
};
export type OrderAuditLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
    where: Prisma.OrderAuditLogWhereUniqueInput;
};
export type OrderAuditLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.OrderAuditLogWhereInput;
    limit?: number;
};
export type OrderAuditLog$performedByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
};
export type OrderAuditLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.OrderAuditLogSelect<ExtArgs> | null;
    omit?: Prisma.OrderAuditLogOmit<ExtArgs> | null;
    include?: Prisma.OrderAuditLogInclude<ExtArgs> | null;
};
export {};
