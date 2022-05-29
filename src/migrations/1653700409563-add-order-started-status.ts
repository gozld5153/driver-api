import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrderStartedStatus1653700409563 implements MigrationInterface {
    name = 'addOrderStartedStatus1653700409563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`startedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'no-driver', 'started', 'driver-matched', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'no-driver', 'driver-matched', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`startedAt\``);
    }

}
