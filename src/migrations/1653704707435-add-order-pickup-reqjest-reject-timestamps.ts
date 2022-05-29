import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrderPickupReqjestRejectTimestamps1653704707435 implements MigrationInterface {
    name = 'addOrderPickupReqjestRejectTimestamps1653704707435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`pickupRequestedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`pickupRejectedAt\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'no-driver', 'started', 'driver-matched', 'hero-requested', 'hero-rejected', 'pickup-requested', 'pickup-rejected', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` enum ('pending', 'no-driver', 'started', 'driver-matched', 'hero-requested', 'hero-rejected', 'hero-matched', 'hero-pickuped', 'loaded', 'departed', 'arrived', 'fee-calculated', 'completed', 'canceled') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`pickupRejectedAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`pickupRequestedAt\``);
    }

}
