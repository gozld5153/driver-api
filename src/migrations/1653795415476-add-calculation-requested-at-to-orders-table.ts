import { MigrationInterface, QueryRunner } from "typeorm";

export class addCalculationRequestedAtToOrdersTable1653795415476 implements MigrationInterface {
    name = 'addCalculationRequestedAtToOrdersTable1653795415476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`feeRequestedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('no-driver', 'pending', 'started', 'driver-matched', 'hero-requested', 'hero-rejected', 'pickup-requested', 'pickup-rejected', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-requested', 'fee-calculated', 'completed', 'canceled') NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'no-driver', 'started', 'driver-matched', 'hero-requested', 'hero-rejected', 'pickup-requested', 'pickup-rejected', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`feeRequestedAt\``);
    }

}
