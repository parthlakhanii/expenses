import React from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
const ExpenseTotal = ({ total }) => (
  <Row gutter={16}>
    <Col span={6}>
      <Card bordered={true}>
        <Statistic
          title="Expense"
          value={total.totalExpense}
          precision={2}
          valueStyle={{
            color: "#cf1322",
          }}
          // prefix={<ArrowUpOutlined />}
          // suffix="%"
        />
      </Card>
    </Col>
    <Col span={6}>
      <Card bordered={true}>
        <Statistic
          title="Income"
          value={total.totalIncome}
          precision={2}
          valueStyle={{
            color: "#3f8600",
          }}
          // prefix={<ArrowDownOutlined />}
          // suffix="%"
        />
      </Card>
    </Col>
    <Col span={6}>
      <Card bordered={true}>
        <Statistic
          title="Investment"
          value={total.totalInvestment}
          precision={2}
          valueStyle={{
            color: "blue",
          }}
          // prefix={<ArrowDownOutlined />}
          // suffix="%"
        />
      </Card>
    </Col>
    <Col span={6}>
      <Card bordered={true}>
        <Statistic
          title="Others"
          value={total.totalOthers}
          precision={2}
          valueStyle={{
            color: "gray",
          }}
          // prefix={<ArrowDownOutlined />}
          // suffix="%"
        />
      </Card>
    </Col>
  </Row>
);
export default ExpenseTotal;
